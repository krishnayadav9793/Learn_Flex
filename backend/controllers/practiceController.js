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

  const numericMatch = text.match(/-?\d+(?:\.\d+)?/);
  if (numericMatch) {
    return numericMatch[0];
  }

  return text.toLowerCase().replace(/\s+/g, "").replace(/[()]/g, "");
};

const isAnswerCorrect = (userAnswer, correctAnswer) => {
  if (correctAnswer === null || correctAnswer === undefined || correctAnswer === "") return false;
  
  const normUser = normalizeAnswer(userAnswer);
  const normCorrect = normalizeAnswer(correctAnswer);
  
  const match = normUser === normCorrect;
  
  // Debug log for mismatches if they occur during runtime (optional based on environment)
  // if (!match && userAnswer && userAnswer !== "null") {
  //   console.log(`[DEBUG] Answer mismatch: User="${userAnswer}" (norm:${normUser}) vs Correct="${correctAnswer}" (norm:${normCorrect})`);
  // }
  
  return match;
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

    // Secondary identification: Name fallback (Critical for UPSC)
    if (examName && examName.toUpperCase().includes("UPSC")) {
       if (marking.correctMarks === 4 && marking.negativeMarks === -1) {
         marking.correctMarks = 1;
         marking.negativeMarks = -0.33;
         console.log(`[DEBUG] Using Hardcoded UPSC Fallback: +1/-0.33`);
       }
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
            AND (${examId || null}::uuid IS NULL OR "Exam_id" = ${examId || null}::uuid)
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
            AND (${examId || null}::uuid IS NULL OR "Exam_id" = ${examId || null}::uuid)
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
    const now = Date.now();
    const expiresAt = new Date(now + timeLimitMinutes * 60 * 1000).toISOString();

    const session = {
      sessionId,
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
      
      // Secondary identification: Name fallback (Critical for UPSC)
      if (examName && examName.toUpperCase().includes("UPSC")) {
        if (session.correctMarks === 4 && session.negativeMarks === -1) {
          session.correctMarks = 1;
          session.negativeMarks = -0.33;
          session.scoringMode = "+1/-0.33";
          console.log(`[DEBUG] Using Hardcoded UPSC Fallback for session: +1/-0.33`);
        }
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
      const subjectIdRes = await sql`SELECT subject_id FROM "Subject" WHERE subject_name ILIKE ${session.subject} LIMIT 1`;
      const subjectId = subjectIdRes.length ? subjectIdRes[0].subject_id : (DB_SUBJECT_MAP[normalizeSubject(session.subject)] || 1);

      const dbSessionId = session.sessionId;

      await sql`
        INSERT INTO practice_submissions (
          submission_id, user_id, subject_id, exam_id, score, max_score, 
          percentage, attempted, correct, wrong, started_at, submitted_at,
          correct_marks, wrong_marks
        ) VALUES (
          ${dbSessionId}, ${userId}, ${subjectId}, ${session.examId || null}, ${score}, ${maxScore}, 
          ${percentage}, ${attempted}, ${correct}, ${wrong}, 
          ${session.startedAt}, ${result.submittedAt},
          ${correctMarks}, ${negativeMarks}
        )
      `;

      let qOrder = 1;
      for (const qr of result.questionResults) {
         try {
           if (!qr.isCorrect && qr.userAnswer && qr.userAnswer !== "null") {
             console.log(`[SCORING_DEBUG] Incorrect: QID=${qr.questionId} User="${qr.userAnswer}" vs Correct="${qr.correctAnswer}"`);
           }
           
           await sql`
             INSERT INTO practice_submission_answers (
               submission_id, question_id, user_answer, correct_answer, 
               is_correct, marks_awarded, question_order
             ) VALUES (
               ${dbSessionId}::text, ${qr.questionId || null}::text, ${qr.userAnswer || null}::text, ${qr.correctAnswer || null}::text, 
               ${qr.isCorrect || false}::boolean, ${qr.marksAwarded || 0}::double precision, ${qOrder++}::integer
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
      const cMarks = Number(row.correct_marks);
      const wMarks = Number(row.wrong_marks);

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
        questionCount: cMarks > 0 ? row.max_score / cMarks : row.max_score / 4,
        scoringMode: `+${cMarks}/${wMarks}`,
        score: row.score,
        maxScore: row.max_score,
        percentage: Number(row.percentage),
        attempted: row.attempted,
        correct: row.correct,
        wrong: row.wrong,
        unanswered: Math.max((cMarks > 0 ? row.max_score / cMarks : row.max_score / 4) - (row.correct + row.wrong), 0),
        startedAt: row.started_at,
        submittedAt: row.submitted_at,
        timeLimitMinutes: 15,
        byTopic: [{ topic: "General", score: row.score, total: cMarks > 0 ? row.max_score / cMarks : row.max_score / 4, attempted: row.attempted, correct: row.correct }],
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
