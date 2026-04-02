import crypto from "crypto";
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
    const excludeIdsRaw = Array.isArray(req.body.excludeIds) ? req.body.excludeIds : [];
    const excludeIds = excludeIdsRaw.map(Number).filter(id => Number.isInteger(id) && id > 0);

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
    if (!question.id) console.error("QUESTION.ID IS MISSING!", question);
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

  const userId = String(req.user?.id || req.user?._id || "guest");

  if (userId !== "guest") {
    try {
      const subjectIdRes = await sql`SELECT subject_id FROM practice_subjects WHERE subject_label ILIKE ${session.subject} LIMIT 1`;
      const subjectId = subjectIdRes.length ? subjectIdRes[0].subject_id : (DB_SUBJECT_MAP[normalizeSubject(session.subject)] || 1);

      const dbSessionId = session.sessionId;

      await sql`
        INSERT INTO practice_submissions (
          submission_id, user_id, subject_id, score, max_score, 
          percentage, attempted, correct, wrong, started_at, submitted_at
        ) VALUES (
          ${dbSessionId}, ${userId}, ${subjectId}, ${score}, ${maxScore}, 
          ${percentage}, ${attempted}, ${correct}, ${wrong}, 
          ${session.startedAt}, ${result.submittedAt}
        )
      `;

      let qOrder = 1;
      for (const qr of result.questionResults) {
         try {
           console.log("DEBUG: qr.questionId =", qr.questionId, "typeof", typeof qr.questionId);
           await sql`
             INSERT INTO practice_submission_answers (
               submission_id, question_id, user_answer, correct_answer, 
               is_correct, marks_awarded, question_order
             ) VALUES (
               ${dbSessionId}::text, ${qr.questionId || null}::text, ${qr.userAnswer || null}::text, ${qr.correctAnswer || null}::text, 
               ${qr.isCorrect || false}::boolean, ${qr.marksAwarded || 0}::integer, ${qOrder++}::integer
             )
           `;
         } catch (answerErr) {
           console.error("FATAL: Failed to insert answer for question", qr.questionId, "Error:", answerErr);
           try {
             const fs = await import("fs");
             fs.writeFileSync("last_db_error.txt", String(answerErr.message || answerErr) + "\n" + JSON.stringify(qr));
           } catch(e) {}
           throw answerErr;
         }
      }
      
      await sql`UPDATE "User_Profile" SET total_solved = total_solved + ${evaluated} WHERE "User_id" = ${userId}`;
      
    } catch (err) {
      console.error("Failed to save practice session to Postgres", err);
      pushFallbackHistory(userId, result);
    }
  } else {
    pushFallbackHistory(userId, result);
  }

  return res.json(result);
};

export const getPracticeHistory = async (req, res) => {
  const userId = String(req.user?.id || req.user?._id || "guest");
  if (userId === "guest") return res.json({ history: historyFallback.get(userId) || [] });

  try {
    const submissionsRows = await sql`
      SELECT s.submission_id, ps.subject_label as subject,
             s.started_at, s.submitted_at, s.score, s.max_score, 
             s.percentage, s.attempted, s.correct, s.wrong
      FROM practice_submissions s
      JOIN practice_subjects ps ON s.subject_id = ps.subject_id
      WHERE s.user_id = ${userId}
      ORDER BY s.submitted_at DESC
      LIMIT 30
    `;

    const history = [];
    for (const row of submissionsRows) {
      const answerRows = await sql`
        SELECT a.question_id as qno, a.question_id as "questionId", 
               a.user_answer as "userAnswer", a.correct_answer as "correctAnswer",
               a.is_correct as "isCorrect", a.marks_awarded as "marksAwarded",
               'General' as topic
        FROM practice_submission_answers a
        WHERE a.submission_id = ${row.submission_id}
        ORDER BY a.question_order ASC
      `;

      history.push({
        userId,
        subject: row.subject,
        selectedTopics: ["General"],
        questionCount: row.max_score / 4,
        scoringMode: "+4/-1",
        score: row.score,
        maxScore: row.max_score,
        percentage: Number(row.percentage),
        attempted: row.attempted,
        correct: row.correct,
        wrong: row.wrong,
        unanswered: Math.max((row.max_score / 4) - (row.correct + row.wrong), 0),
        startedAt: row.started_at,
        submittedAt: row.submitted_at,
        timeLimitMinutes: 15,
        byTopic: [{ topic: "General", score: row.score, total: row.max_score / 4, attempted: row.attempted, correct: row.correct }],
        questionResults: answerRows
      });
    }

    return res.json({ history });
  } catch (err) {
    console.error("Failed to fetch history from Postgres:", err);
    return res.json({ history: historyFallback.get(userId) || [] });
  }
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
