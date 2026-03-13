import { sql } from "../util/neonConnect.js";

export const generateDailyChallenge = async () => {
  console.log("Generating daily challenge...");
  const exams = await sql`SELECT exam_id FROM "Exam"`;
  const today = new Date();
  const seed = (today.getFullYear() * 10000) + ((today.getMonth() + 1) * 100) + today.getDate() +
  (exam.exam_id * 100) + subject.subject_id;

  const a = 1664525;
  const c = 1013904223;

  for(const exam of exams){
    const challenge = await sql`
      INSERT INTO "DailyChallenge"
      (exam_id, challenge_date, time_limit)
      VALUES (${exam.exam_id}, CURRENT_DATE, 60)
      RETURNING challenge_id
    `;

    const challengeId = challenge[0].challenge_id;
    const subjects = await sql`
      SELECT subject_id
      FROM "Subject"
      WHERE exam_id = ${exam.exam_id}
    `;
    for (const subject of subjects) {
      const questions = await sql`
        SELECT "Ques_id"
        FROM "Questions"
        WHERE subject_id = ${subject.subject_id}
        ORDER BY "Ques_id"
      `;
      const m = questions.length;
      if (m === 0) continue;
      const index = (a * (seed + subject.subject_id) + c) % m;
      const questionId = questions[index].Ques_id;
      await sql`
        INSERT INTO "DailyChallengeQuestions"
        (challenge_id, ques_id)
        VALUES (${challengeId}, ${questionId})
      `;
    }
  }
};