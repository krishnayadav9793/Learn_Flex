import { configDotenv } from "dotenv";
import mongoose from "mongoose";
import PracticeQuestion from "../models/practiceQuestion.js";
import { listPracticeSubjects, loadSubjectQuestions } from "../util/practicePdfLoader.js";
import { hasMongoConfig } from "../util/envFlags.js";

configDotenv();

if (!hasMongoConfig()) {
  console.error("MONGO_DB_URI is missing. Set it in backend/.env before rebuilding.");
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(process.env.MONGO_DB_URI, { dbName: "LearnFlex" });

  const subjects = listPracticeSubjects().map((item) => item.key);
  for (const subject of subjects) {
    const loaded = await loadSubjectQuestions(subject);
    console.log(`rebuilt ${subject}: ${loaded.count}`);
  }

  for (const subject of subjects) {
    const count = await PracticeQuestion.countDocuments({ subject });
    console.log(`stored ${subject}: ${count}`);
  }

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Failed to rebuild practice bank:", error.message || error);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore disconnect failures
  }
  process.exit(1);
});
