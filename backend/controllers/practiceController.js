import crypto from "crypto";
import PracticeHistory from "../models/practiceHistory.js";
import { hasMongoConfig } from "../util/envFlags.js";
import { sql } from "../util/neonConnect.js";

const sessions = new Map();
const historyFallback = new Map();

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const normalizeSubject = (subject = "") => String(subject).trim().toLowerCase();

const shuffle = (list) => {
  const copy = [...list];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

const normalizeAnswer = (value = "") => {
  const text = String(value).trim();
  if (!text) return "";

  const numericMatch = text.match(/-?\d+(?:\.\d+)?/);
  if (numericMatch) {
    return numericMatch[0];
  }

  return text.toLowerCase().replace(/\s+/g, "").replace(/[()]/g, "");
};

const isAnswerCorrect = (userAnswer, correctAnswer) => {
  if (correctAnswer === null || correctAnswer === undefined || correctAnswer === "") return false;
  return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
};

// Map DB subject_id to frontend keys
const DB_SUBJECT_MAP = {
  physics: 1,
  chemistry: 2,
  mathematics: 3
};

const SUBJECT_LABELS = {
  physics: 'Physics',
  chemistry: 'Chemistry',
  mathematics: 'Mathematics'
};

const REVERSE_SUBJECT_MAP = {
  1: 'physics',
  2: 'chemistry',
  3: 'mathematics'
};

const toClientQuestion = (question, sessionId) => ({
  id: question.id,
  index: question.index,
  qno: question.qno,
  topic: question.topic,
  subject: question.subject,
  statement: question.statement,
  options: question.options,
  questionType: question.questionType || (question.options?.length ? "mcq" : "numeric"),
  optionSource: question.optionSource || "none",
  displayMode: question.displayMode || (question.hasImage ? "image_primary" : "text_only"),
  hasImage: question.hasImage,
  sourcePage: question.sourcePage,
  imageUrl: question.hasImage
    ? `/practice/image/${encodeURIComponent(sessionId)}/${encodeURIComponent(question.id)}`
    : null
});

const serializeSession = (session) => ({
  sessionId: session.sessionId,
  subject: session.subject,
  selectedTopics: session.selectedTopics,
  questionCount: session.questionCount,
  timeLimitMinutes: session.timeLimitMinutes,
  scoringMode: "+4/-1",
  startedAt: session.startedAt,
  expiresAt: session.expiresAt,
  submittedAt: session.submittedAt || null,
  questions: session.questions.map((question) => toClientQuestion(question, session.sessionId)),
  result: session.result || null
});

const pushFallbackHistory = (userId, entry) => {
  const current = historyFallback.get(userId) || [];
  current.unshift(entry);
  historyFallback.set(userId, current.slice(0, 30));
};

export const getPracticeMeta = async (_req, res) => {
  try {
    const stats = await sql`
      SELECT subject_id, COUNT(*) as count 
      FROM "Questions" 
      GROUP BY subject_id
    `;

    const details = stats.map(row => {
      const subjKey = REVERSE_SUBJECT_MAP[row.subject_id] || `subject_${row.subject_id}`;
      const count = Number(row.count) || 0;
      return {
        key: subjKey,
        label: SUBJECT_LABELS[subjKey] || subjKey,
        availableQuestions: count,
        topics: [
          { name: "General", count: count }
        ]
      };
    });

    return res.json({ subjects: details });
  } catch (err) {
    console.error("DB Error in getPracticeMeta:", err);
    return res.status(500).json({ msg: "Failed to load practice metadata" });
  }
};

export const createPracticeSession = async (req, res) => {
  try {
    const subject = normalizeSubject(req.body.subject);
    const subjectId = DB_SUBJECT_MAP[subject];

    if (!subjectId) {
      return res.status(400).json({ msg: "Invalid subject selected" });
    }

    const requestedCount = clamp(Number(req.body.questionCount) || 10, 1, 100);
    const timeLimitMinutes = clamp(Number(req.body.timeLimitMinutes) || 15, 1, 180);
    
    // Support excluding previously seen questions
    const excludeIds = Array.isArray(req.body.excludeIds) 
      ? req.body.excludeIds.filter(id => typeof id === 'string' || typeof id === 'number') 
      : [];

    let dbQuestions = [];
    
    // Attempt to fetch without previously seen questions first
    if (excludeIds.length > 0) {
      dbQuestions = await sql`
        SELECT * FROM (
          SELECT DISTINCT ON (
            COALESCE(
              NULLIF(SUBSTRING(REGEXP_REPLACE("Question_Statement", '\\W+', '', 'g'), 1, 50), ''),
              "Image"
            )
          )
            "Ques_id",
            "Question_Statement",
            "Option_1",
            "Option_2",
            "Option_3",
            "Option_4",
            "Image",
            "Answer"
          FROM "Questions"
          WHERE subject_id = ${subjectId}
            AND "Ques_id" != ALL(${excludeIds})
        ) AS unique_questions
        ORDER BY RANDOM()
        LIMIT ${requestedCount}
      `;
    }

    // If we didn't get enough unseen questions, grab some previously seen ones to meet the requested count
    if (dbQuestions.length < requestedCount && excludeIds.length > 0) {
      const remainingCount = requestedCount - dbQuestions.length;
      
      const excludeFromExtra = dbQuestions.length > 0 
        ? dbQuestions.map(q => q.Ques_id) 
        : [];

      const extraQuestions = await sql`
        SELECT * FROM (
          SELECT DISTINCT ON (
            COALESCE(
              NULLIF(SUBSTRING(REGEXP_REPLACE("Question_Statement", '\\W+', '', 'g'), 1, 50), ''),
              "Image"
            )
          )
            "Ques_id",
            "Question_Statement",
            "Option_1",
            "Option_2",
            "Option_3",
            "Option_4",
            "Image",
            "Answer"
          FROM "Questions"
          WHERE subject_id = ${subjectId}
            AND "Ques_id" = ANY(${excludeIds})
            ${excludeFromExtra.length > 0 ? sql`AND "Ques_id" != ALL(${excludeFromExtra})` : sql``}
        ) AS unique_extra
        ORDER BY RANDOM()
        LIMIT ${remainingCount}
      `;
      
      dbQuestions = [...dbQuestions, ...extraQuestions];
      dbQuestions.sort(() => Math.random() - 0.5);
    }

    if (!dbQuestions || dbQuestions.length === 0) {
      // Ultimate fallback if exclude logic completely fails or no excludeIds provided
      dbQuestions = await sql`
        SELECT * FROM (
          SELECT DISTINCT ON (
            COALESCE(
              NULLIF(SUBSTRING(REGEXP_REPLACE("Question_Statement", '\\W+', '', 'g'), 1, 50), ''),
              "Image"
            )
          )
            "Ques_id",
            "Question_Statement",
            "Option_1",
            "Option_2",
            "Option_3",
            "Option_4",
            "Image",
            "Answer"
          FROM "Questions"
          WHERE subject_id = ${subjectId}
        ) AS unique_fallback
        ORDER BY RANDOM()
        LIMIT ${requestedCount}
      `;
    }

    if (!dbQuestions || dbQuestions.length === 0) {
      return res.status(400).json({ msg: "No questions found for selected subject" });
    }

    const mappedQuestions = dbQuestions.map((row, index) => {
      // Map options
      const options = [];
      if (row.Option_1) options.push({ key: "1", text: row.Option_1 });
      if (row.Option_2) options.push({ key: "2", text: row.Option_2 });
      if (row.Option_3) options.push({ key: "3", text: row.Option_3 });
      if (row.Option_4) options.push({ key: "4", text: row.Option_4 });

      return {
        id: String(row.Ques_id),
        index: index + 1,
        qno: row.Ques_id,
        topic: "General",
        subject: subject,
        statement: row.Question_Statement || "",
        options,
        questionType: options.length > 0 ? "mcq" : "numeric",
        correctAnswer: String(row.Answer),
        hasImage: !!row.Image,
        originalImageUrl: row.Image, // Stores the Cloudinary link securely
        sourcePage: 1
      };
    });

    const sessionId = crypto.randomUUID();
    const now = Date.now();
    const expiresAt = new Date(now + timeLimitMinutes * 60 * 1000).toISOString();

    const session = {
      sessionId,
      subject,
      selectedTopics: ["General"],
      questionCount: mappedQuestions.length,
      timeLimitMinutes,
      scoringMode: "+4/-1",
      startedAt: new Date(now).toISOString(),
      expiresAt,
      questions: mappedQuestions,
      submittedAt: null,
      result: null
    };

    sessions.set(sessionId, session);
    return res.json(serializeSession(session));
  } catch (err) {
    console.error("DB error in createPracticeSession:", err);
    return res.status(500).json({ msg: "Unable to create practice session via Database" });
  }
};

export const getPracticeSession = (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ msg: "Practice session not found" });
  }
  return res.json(serializeSession(session));
};

export const submitPracticeSession = async (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ msg: "Practice session not found" });
  }

  if (session.result) {
    return res.json(session.result);
  }

  const answers = req.body?.answers && typeof req.body.answers === "object" ? req.body.answers : {};

  let attempted = 0;
  let correct = 0;
  let wrong = 0;
  let evaluated = 0;
  let score = 0;

  const byTopic = {};
  const questionResults = [];

  for (const question of session.questions) {
    const userAnswer = String(answers[question.id] ?? "").trim();
    const correctAnswer = question.correctAnswer;
    const evaluatedThisQuestion = !!(correctAnswer || correctAnswer === 0);

    if (!byTopic[question.topic]) {
      byTopic[question.topic] = {
        topic: question.topic,
        total: 0,
        attempted: 0,
        correct: 0,
        score: 0
      };
    }

    byTopic[question.topic].total += 1;

    if (userAnswer) {
      attempted += 1;
      byTopic[question.topic].attempted += 1;
    }

    let isCorrect = false;
    let marksAwarded = 0;

    if (evaluatedThisQuestion) {
      evaluated += 1;
      if (userAnswer) {
        isCorrect = isAnswerCorrect(userAnswer, correctAnswer);
        if (isCorrect) {
          correct += 1;
          marksAwarded = 4;
          byTopic[question.topic].correct += 1;
        } else {
          wrong += 1;
          marksAwarded = -1;
        }
      }
    }

    score += marksAwarded;
    byTopic[question.topic].score += marksAwarded;

    questionResults.push({
      questionId: question.id,
      qno: question.qno,
      topic: question.topic,
      userAnswer,
      correctAnswer,
      isCorrect,
      evaluated: evaluatedThisQuestion,
      marksAwarded
    });
  }

  const maxScore = evaluated * 4;
  const percentage = maxScore ? Number(((score / maxScore) * 100).toFixed(2)) : 0;
  const unanswered = Math.max(evaluated - (correct + wrong), 0);
  const unevaluated = session.questions.length - evaluated;

  const result = {
    sessionId: session.sessionId,
    subject: session.subject,
    selectedTopics: session.selectedTopics,
    scoringMode: "+4/-1",
    totalQuestions: session.questionCount,
    score,
    maxScore,
    percentage,
    attempted,
    correct,
    wrong,
    unanswered,
    unevaluated,
    submittedAt: new Date().toISOString(),
    byTopic: Object.values(byTopic),
    questionResults
  };

  session.result = result;
  session.submittedAt = result.submittedAt;

  const userId = String(req.user?._id || "guest");
  const historyEntry = {
    userId,
    subject: session.subject,
    selectedTopics: session.selectedTopics,
    questionCount: session.questionCount,
    scoringMode: "+4/-1",
    score,
    maxScore,
    percentage,
    attempted,
    correct,
    wrong,
    unanswered,
    startedAt: new Date(session.startedAt),
    submittedAt: new Date(result.submittedAt),
    timeLimitMinutes: session.timeLimitMinutes,
    byTopic: result.byTopic,
    questionResults: result.questionResults
  };

  if (hasMongoConfig()) {
    try {
      await PracticeHistory.create(historyEntry);
    } catch {
      pushFallbackHistory(userId, historyEntry);
    }
  } else {
    pushFallbackHistory(userId, historyEntry);
  }

  return res.json(result);
};

export const getPracticeHistory = async (req, res) => {
  const userId = String(req.user?._id || "guest");

  if (hasMongoConfig()) {
    try {
      const history = await PracticeHistory.find({ userId })
        .sort({ submittedAt: -1 })
        .limit(30)
        .lean();
      return res.json({ history });
    } catch {
      // fall back to in-memory history
    }
  }

  return res.json({ history: historyFallback.get(userId) || [] });
};

export const getPracticeQuestionImage = async (req, res) => {
  try {
    const sessionId = String(req.params.sessionId || "");
    const questionId = String(req.params.questionId || "");

    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ msg: "Practice session not found" });
    }

    const question = session.questions.find((item) => String(item.id) === questionId);
    if (!question || !question.hasImage) {
      return res.status(404).json({ msg: "Question image not found" });
    }

    // Since we fetch directly from Cloudinary via DB, redirect the frontend locally
    return res.redirect(question.originalImageUrl);
  } catch {
    return res.status(404).json({ msg: "Question image not found" });
  }
};
