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

  // If it's a simple single-digit MCQ key (1, 2, 3, 4), return it immediately
  // This prevents numericMatch from incorrectly extracting numbers from option text
  if (/^[1-4]$/.test(text)) {
    return text;
  }

  const numericMatch = text.match(/^-?\d+(?:\.\d+)?$/);
  if (numericMatch) {
    // Return the number itself as a string, but we'll compare numerically later if both match this
    return numericMatch[0];
  }

  return text.toLowerCase().replace(/\s+/g, "").replace(/[()]/g, "");
};

const isAnswerCorrect = (userAnswer, correctAnswer) => {
  if (correctAnswer === null || correctAnswer === undefined || correctAnswer === "") return false;
  
  const normUser = normalizeAnswer(userAnswer);
  const normCorrect = normalizeAnswer(correctAnswer);
  
  // Strict string match first
  if (normUser === normCorrect) return true;

  // Numerical comparison fallback
  const numUser = Number(normUser);
  const numCorrect = Number(normCorrect);
  if (!isNaN(numUser) && !isNaN(numCorrect) && numUser === numCorrect) {
    return true;
  }
  
  return false;
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
  examId: session.examId || null, // Critical for consistent resumption
  selectedTopics: session.selectedTopics,
  questionCount: session.questionCount,
  timeLimitMinutes: session.timeLimitMinutes,
  scoringMode: session.scoringMode || "+4/-1",
  startedAt: session.startedAt,
  expiresAt: session.expiresAt,
  submittedAt: session.submittedAt || null,
  questions: session.questions.map((question) => toClientQuestion(question, session.sessionId)),
  answers: session.answers || {}, // Include persistence state
  result: session.result || null
});

const pushFallbackHistory = (userId, entry) => {
  const current = historyFallback.get(userId) || [];
  current.unshift(entry);
  historyFallback.set(userId, current.slice(0, 30));
};

export const getPracticeMeta = async (req, res) => {
  try {
    const examName = req.query.examName ? String(req.query.examName).trim() : null;
    let examId = null;
    
    console.log(`[DEBUG] getPracticeMeta called with examName: "${examName}"`);

    if (examName) {
      const examRes = await sql`SELECT exam_id, exam_name FROM "Exam" WHERE REPLACE(exam_name, ' ', '') ILIKE REPLACE(${examName}, ' ', '') LIMIT 1`;
      if (examRes.length > 0) {
        examId = examRes[0].exam_id;
        console.log(`[DEBUG] Found examId: ${examId} for name: ${examRes[0].exam_name}`);
      } else {
        console.log(`[DEBUG] No exam found for name: ${examName}`);
      }
    }

    let stats;
    if (examId) {
      stats = await sql`
        SELECT q.subject_id, s.subject_name as subject_name, COUNT(*) as count 
        FROM "Questions" q
        LEFT JOIN "Subject" s ON q.subject_id = s.subject_id
        WHERE q."Exam_id" = ${examId}
        GROUP BY q.subject_id, s.subject_name
      `;
    } else {
      stats = await sql`
        SELECT q.subject_id, s.subject_name as subject_name, COUNT(*) as count 
        FROM "Questions" q
        LEFT JOIN "Subject" s ON q.subject_id = s.subject_id
        GROUP BY q.subject_id, s.subject_name
      `;
    }

    const details = stats.map(row => {
      const subjKey = row.subject_name || `subject_${row.subject_id}`;
      const count = Number(row.count) || 0;
      return {
        key: subjKey,
        label: row.subject_name || `Subject ${row.subject_id}`,
        availableQuestions: count,
        topics: [
          { name: "General", count: count }
        ]
      };
    });

    let marking = { correctMarks: 4, negativeMarks: -1 };
    
    // Primary identification: DB match
    if (examId) {
      try {
        const markingRes = await sql`SELECT correct_marks, wrong_marks FROM "Exam_Marking" WHERE exam_id = ${examId} LIMIT 1`;
        if (markingRes.length > 0) {
          marking.correctMarks = Number(markingRes[0].correct_marks);
          marking.negativeMarks = Number(markingRes[0].wrong_marks);
          console.log(`[DEBUG] Using DB marking: +${marking.correctMarks}/${marking.negativeMarks}`);
        } else {
          console.log(`[DEBUG] No marking record found in DB for examId: ${examId}`);
        }
      } catch (e) {
        console.error("[DEBUG] Error fetching marking from DB:", e);
      }
    }

    // Secondary identification: Name fallback (CRITICAL: UPSC must be +1/-0.33)
    if (examName && examName.toUpperCase().includes("UPSC")) {
      marking.correctMarks = 1;
      marking.negativeMarks = -0.33;
      console.log(`[DEBUG] Enforcing strict UPSC Marking: +1/-0.33`);
    }

    return res.json({ subjects: details, marking });
  } catch (err) {
    console.error("DB Error in getPracticeMeta:", err);
    return res.status(500).json({ msg: "Failed to load practice metadata" });
  }
};

export const createPracticeSession = async (req, res) => {
  try {
    const examName = req.body.examName ? String(req.body.examName).trim() : null;
    let examId = null;
    if (examName) {
      const examRes = await sql`SELECT exam_id FROM "Exam" WHERE REPLACE(exam_name, ' ', '') ILIKE REPLACE(${examName}, ' ', '') LIMIT 1`;
      if (examRes.length > 0) examId = examRes[0].exam_id;
    }

    const subject = normalizeSubject(req.body.subject);
    const subjectRes = await sql`SELECT subject_id FROM "Subject" WHERE subject_name ILIKE ${subject} LIMIT 1`;
    const subjectId = subjectRes.length > 0 ? subjectRes[0].subject_id : DB_SUBJECT_MAP[subject];

    if (!subjectId) {
      return res.status(400).json({ msg: "Invalid subject selected" });
    }

    const requestedCount = clamp(Number(req.body.questionCount) || 10, 1, 100);
    const timeLimitMinutes = clamp(Number(req.body.timeLimitMinutes) || 15, 1, 180);
    
    // Support excluding previously seen questions
    const excludeIdsRaw = Array.isArray(req.body.excludeIds) ? req.body.excludeIds : [];
    const excludeIds = excludeIdsRaw.map(id => String(id).trim()).filter(id => id.length > 0);

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
            AND (${examId || null}::uuid IS NULL OR "Exam_id" = ${examId || null}::uuid)
            AND "Ques_id"::text != ALL(${excludeIds}::text[])
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
            AND (${examId || null}::uuid IS NULL OR "Exam_id" = ${examId || null}::uuid)
            AND "Ques_id"::text = ANY(${excludeIds}::text[])
            ${excludeFromExtra.length > 0 ? sql`AND "Ques_id"::text != ALL(${excludeFromExtra.map(String)}::text[])` : sql``}
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
            AND (${examId || null}::uuid IS NULL OR "Exam_id" = ${examId || null}::uuid)
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
    const userId = String(req.user?.id || req.user?._id || "guest");
    const now = Date.now();
    const expiresAt = new Date(now + timeLimitMinutes * 60 * 1000).toISOString();
  
    const session = {
      sessionId,
      userId, // Associate session with user for recovery
      subject,
      examId, // Store the exam link
      selectedTopics: ["General"],
      questionCount: mappedQuestions.length,
      timeLimitMinutes,
      scoringMode: "+4/-1",
      correctMarks: 4,
      negativeMarks: -1,
      startedAt: new Date(now).toISOString(),
      expiresAt,
      questions: mappedQuestions,
      answers: {}, // Initialize empty answers for persistence
      submittedAt: null,
      result: null
    };

    console.log(`[DEBUG] createPracticeSession called with examName: "${examName}"`);

    // Try to get marks from DB
    try {
      if (examId) {
        const markingRes = await sql`SELECT correct_marks, wrong_marks FROM "Exam_Marking" WHERE exam_id = ${examId} LIMIT 1`;
        if (markingRes.length > 0) {
          session.correctMarks = Number(markingRes[0].correct_marks);
          session.negativeMarks = Number(markingRes[0].wrong_marks);
          session.scoringMode = `+${session.correctMarks}/${session.negativeMarks}`;
          console.log(`[DEBUG] Using DB marking for session: ${session.scoringMode}`);
        } else {
          console.log(`[DEBUG] No marking record found in DB for session examId: ${examId}`);
        }
      }
      
      // Secondary identification: Name fallback (CRITICAL: UPSC must be +1/-0.33)
      if (examName && examName.toUpperCase().includes("UPSC")) {
        session.correctMarks = 1;
        session.negativeMarks = -0.33;
        session.scoringMode = "+1/-0.33";
        console.log(`[DEBUG] Enforcing strict UPSC Marking for session: +1/-0.33`);
      }
    } catch (e) {
      console.error("[DEBUG] Failed to fetch marking info, using defaults", e);
    }

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

export const getActiveSession = (req, res) => {
  const userId = String(req.user?.id || req.user?._id || "guest");
  if (userId === "guest") return res.status(404).json({ msg: "No active session for guests" });

  const now = new Date();
  
  // Find an unsubmitted, non-expired session for this user
  const activeSession = Array.from(sessions.values()).find(s => 
    s.userId === userId && 
    !s.submittedAt && 
    new Date(s.expiresAt) > now
  );

  if (!activeSession) {
    console.log(`[DEBUG] No active session found for user: ${userId}`);
    return res.status(404).json({ msg: "No active session found" });
  }

  console.log(`[DEBUG] Resuming session: ${activeSession.sessionId} for user: ${userId}`);
  return res.json(serializeSession(activeSession));
};

export const discardActiveSession = (req, res) => {
  const userId = String(req.user?.id || req.user?._id || "guest");
  if (userId === "guest") return res.status(404).json({ msg: "No session for guests" });

  const activeSessionEntry = Array.from(sessions.entries()).find(([id, s]) => 
    s.userId === userId && !s.submittedAt
  );

  if (activeSessionEntry) {
    const [sessionId] = activeSessionEntry;
    sessions.delete(sessionId);
    console.log(`[DEBUG] Discarded session: ${sessionId} for user: ${userId}`);
    return res.json({ msg: "Active session discarded successfully" });
  }

  return res.status(404).json({ msg: "No active session found to discard" });
};

export const submitPracticeSession = async (req, res) => {
  const sessionId = req.params.sessionId;
  const session = sessions.get(sessionId);
  if (!session) {
    console.warn(`[DEBUG] submitPracticeSession: Session ${sessionId} not found in Map!`);
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

  const correctMarks = session.correctMarks !== undefined ? session.correctMarks : 4;
  const negativeMarks = session.negativeMarks !== undefined ? session.negativeMarks : -1;

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
          marksAwarded = correctMarks;
          byTopic[question.topic].correct += 1;
        } else {
          wrong += 1;
          marksAwarded = negativeMarks;
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

  const maxScore = evaluated * correctMarks;
  const scoreRaw = score;
  const finalScore = Number(scoreRaw.toFixed(2));
  const percentage = maxScore ? Number(((finalScore / maxScore) * 100).toFixed(2)) : 0;
  const unanswered = Math.max(evaluated - (correct + wrong), 0);
  const unevaluated = session.questions.length - evaluated;

  const result = {
    sessionId: session.sessionId,
    subject: session.subject,
    selectedTopics: session.selectedTopics,
    scoringMode: session.scoringMode || "+4/-1",
    totalQuestions: session.questionCount,
    score: finalScore,
    maxScore: Number(maxScore.toFixed(2)),
    percentage,
    attempted,
    correct,
    wrong,
    unanswered,
    unevaluated,
    correctMarks,
    negativeMarks,
    submittedAt: new Date().toISOString(),
    byTopic: Object.values(byTopic),
    questionResults
  };

  session.result = result;
  session.submittedAt = result.submittedAt;

  const userId = String(req.user?.id || req.user?._id || "guest");

  if (userId !== "guest") {
    try {
      await sql.begin(async (sql) => {
        const subjectIdRes = await sql`SELECT subject_id FROM "Subject" WHERE subject_name ILIKE ${session.subject} LIMIT 1`;
        const subjectId = subjectIdRes.length ? subjectIdRes[0].subject_id : (DB_SUBJECT_MAP[normalizeSubject(session.subject)] || 1);

        const dbSessionId = session.sessionId;
        const dbExamId = session.examId || null;

        console.log(`[DEBUG] Transaction Start: submission ${dbSessionId}, User ${userId}`);

        await sql`
          INSERT INTO practice_submissions (
            submission_id, user_id, subject_id, exam_id, score, max_score, 
            percentage, attempted, correct, wrong, started_at, submitted_at,
            correct_marks, wrong_marks
          ) VALUES (
            ${dbSessionId}, ${userId}, ${subjectId}, ${dbExamId}, ${score}, ${maxScore}, 
            ${percentage}, ${attempted}, ${correct}, ${wrong}, 
            ${session.startedAt}, ${result.submittedAt},
            ${correctMarks}, ${negativeMarks}
          )
        `;

        let qOrder = 1;
        for (const qr of result.questionResults) {
          await sql`
            INSERT INTO practice_submission_answers (
              submission_id, question_id, user_answer, marked_option, correct_answer, 
              is_correct, marks_awarded, question_order
            ) VALUES (
              ${dbSessionId}, ${String(qr.questionId).trim() || null}, ${qr.userAnswer || null}, ${qr.userAnswer || null}, ${qr.correctAnswer || null}, 
              ${qr.isCorrect || false}, ${qr.marksAwarded || 0}, ${qOrder++}
            )
          `;
        }
        
        await sql`UPDATE "User_Profile" SET total_solved = total_solved + ${evaluated} WHERE "User_id" = ${userId}`;
      });
      console.log(`[DEBUG] Session ${session.sessionId} successfully committed to Postgres.`);
      
    } catch (err) {
      console.error("[DEBUG] Transaction Failed: rolling back and using fallback.", err);
      // Fallback logic if DB is completely unreachable
      pushFallbackHistory(userId, result);
    }
  } else {
    console.log("[DEBUG] Guest session submitted, using fallback history");
    pushFallbackHistory(userId, result);
  }

  return res.json(result);
};

export const getPracticeHistory = async (req, res) => {
  const userId = String(req.user?.id || req.user?._id || "guest");
  if (userId === "guest") return res.json({ history: historyFallback.get(userId) || [] });

  const examName = req.query.examName ? String(req.query.examName).trim() : null;
  const subject  = req.query.subject ? String(req.query.subject).trim() : null;
  let examId = null;

  try {
    if (examName) {
      const examRes = await sql`SELECT exam_id FROM "Exam" WHERE REPLACE(exam_name, ' ', '') ILIKE REPLACE(${examName}, ' ', '') LIMIT 1`;
      if (examRes.length > 0) examId = examRes[0].exam_id;
    }

    const submissionsRows = await sql`
      SELECT s.submission_id, ps.subject_name as subject,
             s.started_at, s.submitted_at, s.score, s.max_score, 
             s.percentage, s.attempted, s.correct, s.wrong,
             COALESCE(s.correct_marks, 4) as correct_marks,
             COALESCE(s.wrong_marks, -1) as wrong_marks
      FROM practice_submissions s
      JOIN "Subject" ps ON s.subject_id = ps.subject_id
      WHERE s.user_id = ${userId}
      ${examId ? sql`AND s.exam_id = ${examId}` : sql``}
      ${subject ? sql`AND ps.subject_name ILIKE ${subject}` : sql``}
      ORDER BY s.submitted_at DESC
      LIMIT 30
    `;

    const history = [];
    for (const row of submissionsRows) {
      const cMarks = Number(row.correct_marks || 4);
      const wMarks = Number(row.wrong_marks || -1);

      const answerRows = await sql`
        SELECT a.question_id as qno, a.question_id as "questionId", 
               a.user_answer as "userAnswer", a.correct_answer as "correctAnswer",
               a.is_correct as "isCorrect", a.marks_awarded as "marksAwarded",
               'General' as topic
        FROM practice_submission_answers a
        WHERE a.submission_id = ${row.submission_id}
        ORDER BY a.question_order ASC
      `;

      const qCount = answerRows.length > 0 ? answerRows.length : Math.round(row.max_score / cMarks);

      history.push({
        userId,
        submissionId: row.submission_id,
        sessionId: row.submission_id,
        subject: row.subject,
        selectedTopics: ["General"],
        questionCount: qCount,
        scoringMode: `+${cMarks}/${wMarks}`,
        score: row.score,
        maxScore: row.max_score,
        percentage: Number(row.percentage),
        attempted: row.attempted,
        correct: row.correct,
        wrong: row.wrong,
        unanswered: Math.max(qCount - (row.correct + row.wrong), 0),
        startedAt: row.started_at,
        submittedAt: row.submitted_at,
        timeLimitMinutes: 15,
        byTopic: [{ topic: "General", score: row.score, total: qCount, attempted: row.attempted, correct: row.correct }],
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

    // 1. Try to get from active memory sessions first
    const session = sessions.get(sessionId);
    if (session) {
      const question = session.questions.find((item) => String(item.id) === questionId);
      if (question && question.originalImageUrl) {
        return res.redirect(question.originalImageUrl);
      }
    }

    // 2. Fallback: Lookup in database (for historical reviews / Activity Log)
    // We use TRIM and casting to ensure matching between text/uuid
    const dbQuestion = await sql`
      SELECT "Image" as "imageUrl" 
      FROM "Questions" 
      WHERE TRIM("Ques_id"::text) = TRIM(${questionId}::text)
      LIMIT 1
    `;

    if (dbQuestion.length > 0 && dbQuestion[0].imageUrl) {
      return res.redirect(dbQuestion[0].imageUrl);
    }

    return res.status(404).json({ msg: "Question image not found" });
  } catch (err) {
    console.error("[DEBUG] Error serving practice image:", err);
    return res.status(404).json({ msg: "Question image not found" });
  }
};

export const getSubmissionDetails = async (req, res) => {
  const { submissionId } = req.params;
  const userId = String(req.user?.id || req.user?._id || "guest");

  try {
    // 1. Get submission summary
    const subRes = await sql`
      SELECT s.submission_id, s.score, s.max_score, s.percentage, s.attempted, 
             s.correct, s.wrong, s.started_at, s.submitted_at, s.correct_marks, s.wrong_marks,
             ps.subject_name as subject
      FROM practice_submissions s
      JOIN "Subject" ps ON s.subject_id = ps.subject_id
      WHERE s.submission_id = ${submissionId} AND s.user_id = ${userId}
      LIMIT 1
    `;

    if (subRes.length === 0) {
      return res.status(404).json({ msg: "Submission not found" });
    }

    const sub = subRes[0];

    // 2. Get questions and answers
    const details = await sql`
      SELECT 
        COALESCE(a.user_answer, a.marked_option) as "userAnswer",
        a.is_correct as "isCorrect",
        a.marks_awarded as "marksAwarded",
        a.question_id as id,
        a.question_id as qno,
        COALESCE(q."Question_Statement", 'Question content is no longer available in the database pool.') as statement,
        q."Image" as "imageUrl",
        a.correct_answer as "correctAnswer",
        jsonb_build_array(
          jsonb_build_object('key', '1', 'text', COALESCE(q."Option_1", 'Option 1')),
          jsonb_build_object('key', '2', 'text', COALESCE(q."Option_2", 'Option 2')),
          jsonb_build_object('key', '3', 'text', COALESCE(q."Option_3", 'Option 3')),
          jsonb_build_object('key', '4', 'text', COALESCE(q."Option_4", 'Option 4'))
        ) as options
      FROM practice_submission_answers a
      LEFT JOIN "Questions" q ON TRIM(a.question_id::text) = TRIM(q."Ques_id"::text)
      WHERE a.submission_id = ${submissionId}
      ORDER BY a.question_order ASC
    `;

    // LEGACY FALLBACK: If no answers found, synthesize a map from summary stats
    if (details.length === 0 && subRes.length > 0) {
      console.warn(`[getSubmissionDetails] Synthesis started for legacy ID: ${submissionId}`);
      const cMarks = Number(sub.correct_marks || 4);
      const wMarks = Number(sub.wrong_marks || -1);
      const totalQ = Math.max(sub.attempted, Math.round(Number(sub.max_score || 0) / cMarks) || 0);
      
      const synthQuestions = [];
      const synthResults = [];
      let qNum = 1;

      // Add correct ones
      for (let i = 0; i < sub.correct; i++) {
        const qid = `synth-${submissionId}-c-${i}`;
        synthQuestions.push({
          id: qid, index: qNum++, topic: "Legacy Record",
          statement: "Detailed text for this legacy session was not preserved, but your correctness status is shown below.",
          options: [], questionType: "mcq", isLegacy: true
        });
        synthResults.push({ questionId: qid, userAnswer: "Correct", correctAnswer: "Correct", isCorrect: true, marksAwarded: cMarks });
      }
      // Add wrong ones
      for (let i = 0; i < sub.wrong; i++) {
        const qid = `synth-${submissionId}-w-${i}`;
        synthQuestions.push({
          id: qid, index: qNum++, topic: "Legacy Record",
          statement: "Detailed text for this legacy session was not preserved, but your correctness status is shown below.",
          options: [], questionType: "mcq", isLegacy: true
        });
        synthResults.push({ questionId: qid, userAnswer: "Incorrect", correctAnswer: "Correct", isCorrect: false, marksAwarded: wMarks });
      }
      // Add remaining as skipped
      while (qNum <= totalQ) {
        const qid = `synth-${submissionId}-s-${qNum}`;
        synthQuestions.push({
          id: qid, index: qNum++, topic: "Legacy Record",
          statement: "This question was skipped in this legacy attempt.",
          options: [], questionType: "mcq", isLegacy: true
        });
        synthResults.push({ questionId: qid, userAnswer: null, correctAnswer: "—", isCorrect: false, marksAwarded: 0 });
      }

      return res.json({
        session: { sessionId: sub.submission_id, subject: sub.subject, questionCount: synthQuestions.length, questions: synthQuestions, isLegacy: true },
        result: {
          sessionId: sub.submission_id, subject: sub.subject, score: sub.score, maxScore: sub.max_score,
          percentage: sub.percentage, correct: sub.correct, wrong: sub.wrong, attempted: sub.attempted,
          unanswered: Math.max(0, totalQ - sub.attempted), submittedAt: sub.submitted_at,
          questionResults: synthResults, isLegacy: true
        }
      });
    }


    const questions = details.map((row, idx) => {
       const options = Array.isArray(row.options) ? row.options : [];
       
       return {
         id: String(row.id),
         index: idx + 1,
         qno: row.qno,
         topic: "General",
         statement: row.statement,
         options,
         questionType: options.length > 0 ? "mcq" : "numeric",
         hasImage: !!row.imageUrl,
         imageUrl: row.imageUrl ? `/practice/image/${encodeURIComponent(submissionId)}/${encodeURIComponent(row.id)}` : null,
         originalImageUrl: row.imageUrl
       };
    });

    const questionResults = details.map(row => ({
      questionId: String(row.id),
      userAnswer: row.userAnswer,
      correctAnswer: row.correctAnswer,
      isCorrect: row.isCorrect,
      marksAwarded: row.marksAwarded
    }));

    const result = {
      sessionId: sub.submission_id,
      subject: sub.subject,
      score: sub.score,
      maxScore: sub.max_score,
      percentage: sub.percentage,
      correct: sub.correct,
      wrong: sub.wrong,
      attempted: sub.attempted,
      unanswered: Math.max(sub.max_score / (sub.correct_marks || 4) - (sub.correct + sub.wrong), 0),
      submittedAt: sub.submitted_at,
      questionResults
    };

    return res.json({
      session: {
        sessionId: sub.submission_id,
        subject: sub.subject,
        questionCount: questions.length,
        questions
      },
      result
    });

  } catch (err) {
    console.error("FATAL Error in getSubmissionDetails:", err);
    // Write to a diagnostic file so the AI can read it
    try {
      const fs = await import("fs");
      fs.appendFileSync("C:/Documents/Learn_Flex-main/backend_error_log.txt", `\n[${new Date().toISOString()}] Submission ${submissionId}: ${err.message}\n${err.stack}\n`);
    } catch (e) {}
    
    return res.status(500).json({ 
      msg: "Failed to load submission details", 
      error: err.message,
      submissionId 
    });
  }
};

export const updateSessionAnswers = (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ msg: "Practice session not found" });
  }

  if (session.submittedAt) {
    return res.status(400).json({ msg: "Cannot update answers for a submitted session" });
  }

  const { answers } = req.body;
  if (answers && typeof answers === "object") {
    session.answers = { ...session.answers, ...answers };
  }

  return res.json({ success: true, answers: session.answers });
};
