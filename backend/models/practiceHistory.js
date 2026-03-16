import mongoose from "mongoose";

const PracticeHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    subject: {
      type: String,
      required: true
    },
    selectedTopics: {
      type: [String],
      default: []
    },
    questionCount: {
      type: Number,
      required: true
    },
    scoringMode: {
      type: String,
      default: "+4/-1"
    },
    score: {
      type: Number,
      required: true
    },
    maxScore: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      required: true
    },
    attempted: {
      type: Number,
      required: true
    },
    correct: {
      type: Number,
      required: true
    },
    wrong: {
      type: Number,
      required: true
    },
    unanswered: {
      type: Number,
      required: true
    },
    startedAt: {
      type: Date,
      required: true
    },
    submittedAt: {
      type: Date,
      required: true
    },
    timeLimitMinutes: {
      type: Number,
      required: true
    },
    byTopic: {
      type: [Object],
      default: []
    },
    questionResults: {
      type: [Object],
      default: []
    }
  },
  { timestamps: true }
);

const PracticeHistory = mongoose.model("PracticeHistory", PracticeHistorySchema, "practice_history");

export default PracticeHistory;

