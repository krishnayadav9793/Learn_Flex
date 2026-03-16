import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { PDFParse } from "pdf-parse";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import PracticeQuestion from "../models/practiceQuestion.js";
import { hasMongoConfig } from "./envFlags.js";

const MATH_TOPICS = [
  "Basic of Mathematics",
  "Quadratic Equation",
  "Complex Number",
  "Sequences and Series",
  "Permutation Combination",
  "Binomial Theorem",
  "Statistics",
  "Matrices",
  "Determinants",
  "Probability",
  "Sets and Relations",
  "Functions",
  "Limits",
  "Continuity and Differentiability",
  "Application of Derivatives",
  "Indefinite Integration",
  "Definite Integration",
  "Area Under Curves",
  "Differential Equations",
  "Straight Lines",
  "Circle",
  "Parabola",
  "Ellipse",
  "Hyperbola",
  "Trigonometric Ratios & Identities",
  "Trigonometric Equations",
  "Inverse Trigonometric Functions",
  "Vector Algebra",
  "Three Dimensional Geometry"
];

const CHEM_TOPICS = [
  "Some Basic Concepts of Chemistry",
  "Structure of Atom",
  "States of Matter",
  "Thermodynamics (C)",
  "Chemical Equilibrium",
  "Ionic Equilibrium",
  "Redox Reactions",
  "Solutions",
  "Electrochemistry",
  "Chemical Kinetics",
  "Classification of Elements and Periodicity in Properties",
  "Chemical Bonding and Molecular Structure",
  "p Block Elements (Group 13 & 14)",
  "p Block Elements (Group 15, 16, 17 & 18)",
  "d and f Block Elements",
  "Coordination Compounds",
  "Practical Chemistry",
  "General Organic Chemistry",
  "Hydrocarbons",
  "Haloalkanes and Haloarenes",
  "Alcohols Phenols and Ethers",
  "Aldehydes and Ketones",
  "Carboxylic Acid Derivatives",
  "Amines",
  "Biomolecules"
];

const PHYSICS_TOPIC_COUNTS = [
  { topic: "Units Dimensions Errors & Vectors", count: 8 },
  { topic: "Kinematics", count: 7 },
  { topic: "Laws of Motion", count: 2 },
  { topic: "Work Power Energy & Circular Motion", count: 10 },
  { topic: "COM & Collision", count: 3 },
  { topic: "Rotational Motion", count: 9 },
  { topic: "Gravitation", count: 6 },
  { topic: "Simple Harmonic Motion", count: 6 },
  { topic: "Properties of Solids", count: 6 },
  { topic: "Fluid Mechanics", count: 7 },
  { topic: "Thermal Properties", count: 4 },
  { topic: "KTG & Thermodynamics", count: 8 },
  { topic: "Wave Motion", count: 7 },
  { topic: "Electrostatics", count: 11 },
  { topic: "Capacitors", count: 6 },
  { topic: "Current Electricity", count: 14 },
  { topic: "Moving Charges, MEC & Magnetism", count: 10 },
  { topic: "Electromagnetic Induction", count: 11 },
  { topic: "Alternating Current", count: 5 },
  { topic: "Ray Optics", count: 13 },
  { topic: "Wave Optics", count: 8 },
  { topic: "EM Waves", count: 3 },
  { topic: "Semiconductors", count: 6 },
  { topic: "Modern Physics", count: 30 }
];

const SUBJECTS = {
  mathematics: {
    key: "mathematics",
    label: "Mathematics",
    envKey: "PRACTICE_MATH_PDF",
    fallbackPath:
      "C:/Users/meetk/Downloads/Mathematics - JEE Main 2025 January Chapter-wise Question Bank - MathonGo (1).pdf",
    topics: MATH_TOPICS,
    pageRanges: {
      questions: { start: 4, end: 66 },
      answerKeys: { start: 67, end: 68 }
    }
  },
  chemistry: {
    key: "chemistry",
    label: "Chemistry",
    envKey: "PRACTICE_CHEM_PDF",
    fallbackPath:
      "C:/Users/meetk/Downloads/Chemistry - JEE Main 2025 January Chapter-wise Question Bank - MathonGo (1).pdf",
    topics: CHEM_TOPICS,
    pageRanges: {
      questions: { start: 3, end: 104 },
      answerKeys: { start: 105, end: 106 }
    }
  },
  physics: {
    key: "physics",
    label: "Physics",
    envKey: "PRACTICE_PHYSICS_PDF",
    fallbackPath:
      "C:/Users/meetk/Downloads/Top 200 Questions of JEE Main 2023 Physics.pdf",
    topics: PHYSICS_TOPIC_COUNTS.map((item) => item.topic),
    topicCounts: PHYSICS_TOPIC_COUNTS,
    pageRanges: {
      questions: { start: 4, end: 32 },
      answerKeys: { start: 35, end: 36 }
    }
  }
};

const questionCache = new Map();
const markerCache = new Map();
const fullPageImageCache = new Map();
const croppedImageCache = new Map();
const DIAGRAM_DIR = path.join(process.cwd(), "uploads", "practice", "diagrams");
const QUESTION_BANK_SCHEMA_VERSION = 6;

const fallbackBank = {
  mathematics: [
    {
      topic: "Basic of Mathematics",
      qno: 1,
      statement: "If f(x)=x^2-5x+6, find all values of x for which f(x)=0.",
      correctAnswer: "1",
      options: [
        { key: "1", text: "x = 2, 3" },
        { key: "2", text: "x = -2, -3" },
        { key: "3", text: "x = 1, 6" },
        { key: "4", text: "x = 0, 5" }
      ]
    }
  ],
  chemistry: [
    {
      topic: "Some Basic Concepts of Chemistry",
      qno: 1,
      statement:
        "20 mL of 2 M NaOH is mixed with 400 mL of 0.5 M NaOH. Find final molarity (nearest integer x 10^-2 M).",
      correctAnswer: "57",
      options: []
    }
  ],
  physics: [
    {
      topic: "Kinematics",
      qno: 1,
      statement: "Refer the cropped image for the full Physics question statement.",
      correctAnswer: "4",
      options: []
    }
  ]
};

const normalizeToken = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const MCQ_OPTION_KEYS = ["1", "2", "3", "4"];
const buildGenericMcqOptions = () =>
  MCQ_OPTION_KEYS.map((key) => ({
    key,
    text: `Option ${key}`
  }));
const isMcqAnswerKey = (answer) => /^[1-4]$/.test(String(answer ?? "").trim());
const toQuestionType = (options = []) => {
  if (Array.isArray(options) && options.length >= 2) {
    return "mcq";
  }
  return "numeric";
};
const getDiagramRelativePath = (questionId = "") => `practice/diagrams/${slugify(questionId)}.png`;
const getDiagramAbsolutePath = (diagramPath = "") => path.join(process.cwd(), "uploads", diagramPath);

const normalizeStoredQuestion = (entry = {}) => ({
  id: entry.questionId,
  qno: Number(entry.qno) || 0,
  topic: entry.topic || "General",
  statement: entry.statement || "",
  options: Array.isArray(entry.options) ? entry.options : [],
  questionType: entry.questionType || "numeric",
  optionSource: entry.optionSource || "none",
  displayMode: entry.displayMode || "image_primary",
  correctAnswer:
    entry.correctAnswer === null || entry.correctAnswer === undefined
      ? null
      : String(entry.correctAnswer),
  sourcePage: Number(entry.sourcePage) || 0,
  hasImage: Boolean(entry.hasImage),
  diagramPath: entry.diagramPath || null,
  cropHint: entry.cropHint || null,
  sourceFile: entry.sourceFile || "",
  subject: entry.subject || ""
});

const buildPayload = ({ subject, sourceFile, questions }) => ({
  subject,
  sourceFile,
  count: questions.length,
  topics: computeTopicStats(questions),
  questions
});

const readQuestionsFromDb = async (subject) => {
  if (!hasMongoConfig()) return null;

  try {
    const rows = await PracticeQuestion.find({
      subject,
      schemaVersion: QUESTION_BANK_SCHEMA_VERSION
    })
      .select({
        _id: 0,
        questionId: 1,
        subject: 1,
        qno: 1,
        topic: 1,
        statement: 1,
        options: 1,
        questionType: 1,
        optionSource: 1,
        displayMode: 1,
        correctAnswer: 1,
        sourcePage: 1,
        hasImage: 1,
        diagramPath: 1,
        cropHint: 1,
        sourceFile: 1
      })
      .sort({ qno: 1, topic: 1 })
      .lean();
    if (!rows.length) return null;

    return rows.map((row) => {
      const question = normalizeStoredQuestion(row);
      if (!question.sourceFile) {
        question.sourceFile = getPdfPath(subject);
      }
      if (question.hasImage && !question.diagramPath) {
        question.diagramPath = getDiagramRelativePath(question.id);
      }
      return question;
    });
  } catch {
    return null;
  }
};

const saveQuestionsToDb = async (subject, sourceFile, questions) => {
  if (!hasMongoConfig() || !questions.length) return;

  try {
    const existing = await PracticeQuestion.find({ subject }).select({ questionId: 1, diagramPath: 1 }).lean();
    const existingDiagramById = new Map(
      existing.map((item) => [String(item.questionId), item.diagramPath || null])
    );

    const docs = questions.map((question) => ({
      questionId: question.id,
      subject,
      qno: question.qno,
      topic: question.topic,
      statement: question.statement,
      options: question.options || [],
      questionType: question.questionType || toQuestionType(question.options || []),
      optionSource: question.optionSource || "none",
      displayMode: question.displayMode || (question.hasImage ? "image_primary" : "text_only"),
      correctAnswer:
        question.correctAnswer === null || question.correctAnswer === undefined
          ? null
          : String(question.correctAnswer),
      sourcePage: question.sourcePage || 0,
      hasImage: Boolean(question.hasImage),
      diagramPath: existingDiagramById.get(question.id) || question.diagramPath || null,
      cropHint: question.cropHint || null,
      sourceFile: question.sourceFile || sourceFile || "",
      schemaVersion: QUESTION_BANK_SCHEMA_VERSION
    }));

    await PracticeQuestion.deleteMany({ subject });
    if (docs.length) {
      await PracticeQuestion.insertMany(docs, { ordered: false });
    }
  } catch {
    // ignore persistence failures and continue with in-memory payload
  }
};

const sanitizePageText = (raw = "") => {
  return String(raw)
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/--\s*\d+\s*of\s*\d+\s*--/gi, "\n")
    .replace(/JEE Main 2025 January/gi, "\n")
    .replace(/Chapter-wise Question Bank/gi, "\n")
    .replace(/MathonGo/gi, "\n")
    .replace(/TOP 200 Questions JEE MAIN 2023 PHYSICS/gi, "\n")
    .replace(/LEARN LIKE NEVER BEFORE/gi, "\n")
    .replace(/Mohit Goenka[^\n]*/gi, "\n")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const sanitizeStatement = (raw = "") => {
  const cleaned = String(raw)
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/^\s*\|\s*$/gm, "")
    .replace(/^\s*[,.;:]\s*$/gm, "")
    .replace(/JEE Main 2025 January/gi, "")
    .replace(/Chapter-wise Question Bank/gi, "")
    .replace(/MathonGo/gi, "")
    .replace(/TOP 200 Questions JEE MAIN 2023 PHYSICS/gi, "")
    .replace(/LEARN LIKE NEVER BEFORE/gi, "")
    .replace(/Mohit Goenka[^\n]*/gi, "")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n");

  const lines = cleaned
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !/^q\s*ans$/i.test(line));

  return lines.join("\n").trim();
};

const isLikelyReadableStatement = (text = "") => {
  const cleaned = sanitizeStatement(text);
  if (!cleaned) return false;

  const alphaNumCount = (cleaned.match(/[A-Za-z0-9]/g) || []).length;
  if (alphaNumCount < 20) return false;

  const missingTokenMarkers = [
    /\sthe\s*,/gi,
    /\sis\s*,/gi,
    /\sare\s*,/gi,
    /\sof\s+the\s*,/gi,
    /\band\s*[,:.]/gi,
    /\bbe\s+and\s*[,:.]/gi,
    /\bif\s+and\b/gi,
    /\blet\s+and\b/gi,
    /\s,\s*then\s+/gi,
    /\s,\s*where\s+/gi,
    /\s,\s*is\s+equal\s+to/gi,
    /\s,\s*$/gm
  ];
  const markerHits = missingTokenMarkers.reduce(
    (sum, regex) => sum + ((cleaned.match(regex) || []).length > 0 ? 1 : 0),
    0
  );

  return markerHits < 2;
};

const normalizeOptionText = (text = "") =>
  sanitizeStatement(text)
    .replace(/^\(?[1-4]\)?[\.\-:]\s*/, "")
    .replace(/\s+/g, " ")
    .trim();

const isLikelyReadableOption = (text = "") => {
  const cleaned = normalizeOptionText(text);
  if (!cleaned) return false;
  if (/^option\s+\d+$/i.test(cleaned)) return false;

  const alphaNumCount = (cleaned.match(/[A-Za-z0-9]/g) || []).length;
  if (alphaNumCount < 1) return false;

  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length > 18) return false;
  if (cleaned.length > 120) return false;

  return true;
};

const normalizeOptionSet = (options = []) => {
  const normalized = (Array.isArray(options) ? options : [])
    .map((option) => ({
      key: String(option?.key || "").trim(),
      text: normalizeOptionText(option?.text || "")
    }))
    .filter((option) => MCQ_OPTION_KEYS.includes(option.key) && isLikelyReadableOption(option.text))
    .sort((a, b) => Number(a.key) - Number(b.key))
    .filter((option, index, list) => index === list.findIndex((item) => item.key === option.key));

  const hasCompleteSet =
    normalized.length === 4 && MCQ_OPTION_KEYS.every((key) => normalized.some((option) => option.key === key));
  return hasCompleteSet ? normalized : [];
};

const inferTopicFromText = (text = "", topics = []) => {
  const normalizedText = ` ${normalizeToken(text)} `;
  let found = "";

  for (const topic of topics) {
    const normalizedTopic = normalizeToken(topic);
    if (!normalizedTopic) continue;
    if (normalizedText.includes(` ${normalizedTopic} `)) {
      if (!found || normalizedTopic.length > normalizeToken(found).length) {
        found = topic;
      }
    }
  }

  return found;
};

const extractOptionsAndStem = (statement = "") => {
  const optionRegex = /\((1|2|3|4)\)\s*([\s\S]*?)(?=\(\d\)|$)/g;
  const matches = [...String(statement).matchAll(optionRegex)];

  if (matches.length < 2) {
    return {
      stem: sanitizeStatement(statement),
      options: []
    };
  }

  const stem = sanitizeStatement(statement.slice(0, matches[0].index));
  const options = matches
    .map((match) => ({
      key: match[1],
      text: normalizeOptionText(match[2] || "")
    }))
    .filter((option) => isLikelyReadableOption(option.text));

  if (options.length < 2) {
    return { stem, options: [] };
  }

  return { stem, options };
};

const buildPhysicsRanges = () => {
  let start = 1;
  return PHYSICS_TOPIC_COUNTS.map((item) => {
    const range = {
      topic: item.topic,
      start,
      end: start + item.count - 1
    };
    start = range.end + 1;
    return range;
  });
};

const PHYSICS_RANGES = buildPhysicsRanges();

const getPhysicsTopicForQno = (qno) => {
  const range = PHYSICS_RANGES.find((item) => qno >= item.start && qno <= item.end);
  return range ? range.topic : "General Physics";
};

const parseChapterAnswerKey = (answerText, topics) => {
  const topicByNormalized = new Map(topics.map((topic) => [normalizeToken(topic), topic]));
  const answerMap = {};
  let currentTopic = "";

  const lines = String(answerText)
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const rawLine of lines) {
    const line = rawLine.replace(/[ ]{2,}/g, " ").trim();
    const topic = topicByNormalized.get(normalizeToken(line));
    if (topic) {
      currentTopic = topic;
      if (!answerMap[currentTopic]) answerMap[currentTopic] = {};
      continue;
    }

    if (!currentTopic) continue;

    const pairRegex = /(\d+)\.\s*\(([^)]+)\)/g;
    let pair;
    while ((pair = pairRegex.exec(line)) !== null) {
      const qno = Number(pair[1]);
      const answer = String(pair[2]).trim();
      answerMap[currentTopic][qno] = answer;
    }
  }

  return answerMap;
};

const parsePhysicsAnswerKey = (answerText) => {
  const answerMap = {};
  const lines = String(answerText)
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const match = line.match(/^(\d{1,3})\.?\s+(-?\d+(?:\.\d+)?)$/);
    if (!match) continue;

    const qno = Number(match[1]);
    if (qno < 1 || qno > 200) continue;
    answerMap[qno] = match[2];
  }

  return answerMap;
};

const parseChapterQuestions = (subject, pages, topics) => {
  const parsed = [];
  const questionRegex = /Q\s*(\d+)\.\s*/gi;
  let currentTopic = topics[0] || "General";

  for (const page of pages || []) {
    const pageNumber = Number(page?.num) || 0;
    const pageText = sanitizePageText(page?.text || "");
    if (!pageText) continue;

    const pageTopic = inferTopicFromText(pageText, topics);
    if (pageTopic) currentTopic = pageTopic;

    const matches = [...pageText.matchAll(questionRegex)];
    if (!matches.length) continue;

    for (let index = 0; index < matches.length; index += 1) {
      const current = matches[index];
      const next = matches[index + 1];
      const qno = Number(current[1]);

      const segmentStart = Number(current.index) + current[0].length;
      const segmentEnd = next ? Number(next.index) : pageText.length;
      const rawSegment = pageText.slice(segmentStart, segmentEnd);

      const inferredTopic =
        inferTopicFromText(rawSegment, topics) || pageTopic || currentTopic || topics[0] || "General";
      currentTopic = inferredTopic;

      const topicRemovalRegex = new RegExp(`\\b${escapeRegex(inferredTopic)}\\b`, "gi");
      const cleanedSegment = rawSegment.replace(topicRemovalRegex, " ").trim();
      const { stem, options } = extractOptionsAndStem(cleanedSegment);

      let statement = sanitizeStatement(stem || cleanedSegment);
      const hasWeakText = !isLikelyReadableStatement(statement);
      if (hasWeakText) {
        statement = "Refer the question image below for full statement and options.";
      }

      const finalOptions = normalizeOptionSet(options);
      const containsDiagramKeyword = /image|figure|fig\.?|diagram|graph/i.test(cleanedSegment);
      let displayMode = "text_only";
      if (hasWeakText) {
        displayMode = "image_primary";
      } else if (containsDiagramKeyword) {
        displayMode = "text_with_image";
      }

      const hasImage = displayMode !== "text_only";
      const optionSource = finalOptions.length ? "parsed" : "none";
      const questionType = finalOptions.length ? "mcq" : "numeric";

      parsed.push({
        id: `${subject}-${slugify(inferredTopic)}-q${qno}-p${pageNumber}`,
        qno,
        topic: inferredTopic,
        statement,
        options: finalOptions,
        questionType,
        optionSource,
        displayMode,
        sourcePage: pageNumber,
        hasImage,
        diagramPath: null,
        subject
      });
    }
  }

  const dedupe = new Map();
  for (const question of parsed) {
    const key = `${question.topic}|${question.qno}`;
    if (!dedupe.has(key)) {
      dedupe.set(key, question);
    }
  }

  return [...dedupe.values()];
};

const parsePhysicsQuestions = (pages) => {
  const parsed = [];
  const seen = new Set();

  for (const page of pages || []) {
    const pageNumber = Number(page?.num) || 0;
    const text = sanitizePageText(page?.text || "");
    if (!text) continue;

    const regex = /(?:^|\s)(\d{1,3})\./g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const qno = Number(match[1]);
      if (!Number.isInteger(qno) || qno < 1 || qno > 200) continue;
      if (seen.has(qno)) continue;

      seen.add(qno);
      const topic = getPhysicsTopicForQno(qno);

      parsed.push({
        id: `physics-${slugify(topic)}-q${qno}`,
        qno,
        topic,
        statement: "Refer the cropped image for this Physics question.",
        options: [],
        questionType: "numeric",
        optionSource: "none",
        displayMode: "image_primary",
        sourcePage: pageNumber,
        hasImage: true,
        diagramPath: null,
        subject: "physics"
      });
    }
  }

  return parsed.sort((a, b) => a.qno - b.qno);
};

const computeTopicStats = (questions) => {
  const map = new Map();
  for (const question of questions) {
    const topic = question.topic || "General";
    map.set(topic, (map.get(topic) || 0) + 1);
  }

  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

const getSubjectConfig = (subject) => SUBJECTS[subject];

const getPdfPath = (subject) => {
  const config = getSubjectConfig(subject);
  if (!config) throw new Error(`Unknown subject: ${subject}`);
  return process.env[config.envKey] || config.fallbackPath;
};

const withParser = async (pdfPath, callback) => {
  const data = await fs.readFile(pdfPath);
  const parser = new PDFParse({ data });
  try {
    return await callback(parser);
  } finally {
    await parser.destroy();
  }
};

const getTextByRange = async (pdfPath, start, end) => {
  return withParser(pdfPath, (parser) => parser.getText({ first: start, last: end }));
};

const extractQuestionMarkers = async (pdfPath, rangeStart, rangeEnd) => {
  const cacheKey = `${pdfPath}:${rangeStart}:${rangeEnd}`;
  if (markerCache.has(cacheKey)) {
    return markerCache.get(cacheKey);
  }

  const data = new Uint8Array(await fs.readFile(pdfPath));
  const loadingTask = getDocument({ data });

  try {
    const doc = await loadingTask.promise;
    const markersByPage = {};

    for (let pageNum = rangeStart; pageNum <= rangeEnd; pageNum += 1) {
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1 });
      const textContent = await page.getTextContent();

      const markers = [];
      for (const item of textContent.items || []) {
        const raw = String(item.str || "").trim();
        const match = raw.match(/^Q?(\d{1,3})\.$/i);
        if (!match) continue;

        markers.push({
          qno: Number(match[1]),
          x: item.transform[4],
          y: item.transform[5]
        });
      }

      markers.sort((a, b) => {
        const yDiff = b.y - a.y;
        if (Math.abs(yDiff) > 2) return yDiff;
        return a.x - b.x;
      });

      markersByPage[pageNum] = {
        pageWidth: viewport.width,
        pageHeight: viewport.height,
        markers
      };
    }

    markerCache.set(cacheKey, markersByPage);
    return markersByPage;
  } finally {
    await loadingTask.destroy();
  }
};

const buildCropHint = (pageMeta, marker) => {
  if (!pageMeta || !marker) return null;

  const { pageWidth, pageHeight, markers } = pageMeta;
  const hasTwoColumns =
    markers.some((item) => item.x < pageWidth * 0.45) &&
    markers.some((item) => item.x > pageWidth * 0.55);

  const columnType = hasTwoColumns ? (marker.x < pageWidth / 2 ? "left" : "right") : "full";

  const sameColumn = markers
    .filter((item) => {
      if (columnType === "full") return true;
      return columnType === "left" ? item.x < pageWidth / 2 : item.x >= pageWidth / 2;
    })
    .sort((a, b) => b.y - a.y);

  const markerIndex = sameColumn.findIndex(
    (item) => item.qno === marker.qno && Math.abs(item.x - marker.x) < 1 && Math.abs(item.y - marker.y) < 1
  );

  const nextMarker = markerIndex >= 0 ? sameColumn[markerIndex + 1] : null;

  const upperY = Math.min(pageHeight - 10, marker.y + 28);
  let lowerY = nextMarker ? Math.max(10, nextMarker.y + 10) : 10;

  if (upperY - lowerY < 80) {
    lowerY = Math.max(10, upperY - 260);
  }

  let leftX = 8;
  let rightX = pageWidth - 8;

  if (columnType === "left") {
    leftX = 8;
    rightX = pageWidth / 2 - 6;
  }

  if (columnType === "right") {
    leftX = pageWidth / 2 + 6;
    rightX = pageWidth - 8;
  }

  return {
    pageWidth,
    pageHeight,
    leftX,
    rightX,
    upperY,
    lowerY
  };
};

const attachCropHints = async (questions, subject, pdfPath, pageRange) => {
  const markersByPage = await extractQuestionMarkers(pdfPath, pageRange.start, pageRange.end);

  const byPage = new Map();
  for (const question of questions) {
    const page = Number(question.sourcePage || 0);
    if (!byPage.has(page)) byPage.set(page, []);
    byPage.get(page).push(question);
  }

  for (const [pageNumber, pageQuestions] of byPage.entries()) {
    const pageMeta = markersByPage[pageNumber];
    if (!pageMeta?.markers?.length) continue;

    const used = new Set();

    for (const question of pageQuestions) {
      let markerIndex = pageMeta.markers.findIndex(
        (marker, index) => !used.has(index) && marker.qno === question.qno
      );

      if (markerIndex < 0) {
        markerIndex = pageMeta.markers.findIndex((_, index) => !used.has(index));
      }

      if (markerIndex < 0) continue;

      used.add(markerIndex);
      question.cropHint = buildCropHint(pageMeta, pageMeta.markers[markerIndex]);
    }
  }

  return questions;
};

const ensureFullPageImage = async (subject, pdfPath, pageNumber) => {
  const cacheKey = `${subject}:${pdfPath}:${pageNumber}`;
  if (fullPageImageCache.has(cacheKey)) {
    return fullPageImageCache.get(cacheKey);
  }

  const outputDir = path.join(process.cwd(), "uploads", "practice", "pages");
  const outputPath = path.join(outputDir, `${subject}-page-${pageNumber}.png`);

  try {
    await fs.access(outputPath);
    fullPageImageCache.set(cacheKey, outputPath);
    return outputPath;
  } catch {
    // generate file
  }

  await fs.mkdir(outputDir, { recursive: true });

  await withParser(pdfPath, async (parser) => {
    const screenshot = await parser.getScreenshot({
      partial: [pageNumber],
      desiredWidth: 1400,
      imageDataUrl: false,
      imageBuffer: true
    });

    if (!screenshot.pages?.length || !screenshot.pages[0]?.data) {
      throw new Error("Unable to render full page image");
    }

    await fs.writeFile(outputPath, screenshot.pages[0].data);
  });

  fullPageImageCache.set(cacheKey, outputPath);
  return outputPath;
};

const buildFallbackQuestions = (subject) => {
  const fallback = fallbackBank[subject] || [];
  return fallback.map((item, index) => ({
    id: `${subject}-fallback-${index + 1}`,
    qno: item.qno,
    topic: item.topic,
    statement: item.statement,
    options: item.options || [],
    questionType: toQuestionType(item.options || []),
    optionSource: (item.options || []).length ? "parsed" : "none",
    displayMode: "text_only",
    correctAnswer: item.correctAnswer || null,
    sourcePage: 0,
    hasImage: false,
    diagramPath: null,
    cropHint: null,
    sourceFile: getPdfPath(subject),
    subject
  }));
};

export const listPracticeSubjects = () => {
  return Object.values(SUBJECTS).map((item) => ({
    key: item.key,
    label: item.label
  }));
};

export const loadSubjectQuestions = async (subject) => {
  const config = getSubjectConfig(subject);
  if (!config) throw new Error(`Unknown subject: ${subject}`);

  const pdfPath = getPdfPath(subject);
  const cacheKey = `${subject}:${pdfPath}`;
  if (questionCache.has(cacheKey)) {
    return questionCache.get(cacheKey);
  }

  const dbQuestions = await readQuestionsFromDb(subject);
  if (dbQuestions?.length) {
    const payload = buildPayload({
      subject,
      sourceFile: dbQuestions[0]?.sourceFile || pdfPath,
      questions: dbQuestions
    });

    questionCache.set(cacheKey, payload);
    return payload;
  }

  try {
    const questionTextResult = await getTextByRange(
      pdfPath,
      config.pageRanges.questions.start,
      config.pageRanges.questions.end
    );

    const answerTextResult = await getTextByRange(
      pdfPath,
      config.pageRanges.answerKeys.start,
      config.pageRanges.answerKeys.end
    );

    let questions = [];

    if (subject === "physics") {
      const answerMap = parsePhysicsAnswerKey(answerTextResult.text || "");
      questions = parsePhysicsQuestions(questionTextResult.pages || []).map((question) => {
        const correctAnswer = answerMap[question.qno] || null;
        const hasMcqAnswerKey = isMcqAnswerKey(correctAnswer);
        const options = hasMcqAnswerKey ? buildGenericMcqOptions() : [];

        return {
          ...question,
          options,
          correctAnswer,
          questionType: toQuestionType(options),
          optionSource: hasMcqAnswerKey ? "generated" : "none",
          displayMode: "image_primary",
          sourceFile: pdfPath,
          diagramPath: question.hasImage ? getDiagramRelativePath(question.id) : null,
          cropHint: null
        };
      });
    } else {
      const answerMapByTopic = parseChapterAnswerKey(answerTextResult.text || "", config.topics || []);
      questions = parseChapterQuestions(subject, questionTextResult.pages || [], config.topics || []).map(
        (question) => {
          const correctAnswer = answerMapByTopic[question.topic]?.[question.qno] || null;
          const hasMcqAnswerKey = isMcqAnswerKey(correctAnswer);
          const normalizedOptions = normalizeOptionSet(question.options);
          const optionSource = normalizedOptions.length ? "parsed" : hasMcqAnswerKey ? "generated" : "none";
          const finalOptions = normalizedOptions.length
            ? normalizedOptions
            : hasMcqAnswerKey
              ? buildGenericMcqOptions()
              : [];
          const questionType = toQuestionType(finalOptions);

          let displayMode = question.displayMode || "text_only";
          if (!isLikelyReadableStatement(question.statement)) {
            displayMode = "image_primary";
          } else if (optionSource === "generated" && displayMode === "text_only") {
            displayMode = "text_with_image";
          }

          const hasImage = displayMode !== "text_only";
          const statement =
            displayMode === "image_primary"
              ? "Refer the question image below for full statement and options."
              : question.statement;

          return {
            ...question,
            statement,
            options: finalOptions,
            questionType,
            optionSource,
            displayMode,
            correctAnswer,
            hasImage,
            sourceFile: pdfPath,
            diagramPath: hasImage ? getDiagramRelativePath(question.id) : null,
            cropHint: null
          };
        }
      );
    }

    if (!questions.length) {
      questions = buildFallbackQuestions(subject);
    }

    questions = await attachCropHints(questions, subject, pdfPath, config.pageRanges.questions);

    const payload = buildPayload({ subject, sourceFile: pdfPath, questions });

    questionCache.set(cacheKey, payload);
    await saveQuestionsToDb(subject, pdfPath, questions);
    return payload;
  } catch {
    const fallbackQuestions = buildFallbackQuestions(subject);
    const payload = buildPayload({
      subject,
      sourceFile: pdfPath,
      questions: fallbackQuestions
    });

    questionCache.set(cacheKey, payload);
    await saveQuestionsToDb(subject, pdfPath, fallbackQuestions);
    return payload;
  }
};

export const ensureQuestionImage = async (question) => {
  if (!question?.id || !question?.subject) {
    throw new Error("Invalid question image request");
  }

  const cacheKey = question.id;
  if (croppedImageCache.has(cacheKey)) {
    return croppedImageCache.get(cacheKey);
  }

  const diagramPath = question.diagramPath || getDiagramRelativePath(question.id);
  const outputPath = getDiagramAbsolutePath(diagramPath);

  try {
    await fs.access(outputPath);
    question.diagramPath = diagramPath;
    croppedImageCache.set(cacheKey, outputPath);
    return outputPath;
  } catch {
    // generate crop
  }

  if (!question?.sourcePage || !question?.sourceFile) {
    throw new Error("Invalid question image source");
  }

  await fs.mkdir(DIAGRAM_DIR, { recursive: true });

  const fullPagePath = await ensureFullPageImage(question.subject, question.sourceFile, question.sourcePage);

  if (!question.cropHint) {
    await fs.copyFile(fullPagePath, outputPath);
    question.diagramPath = diagramPath;
    croppedImageCache.set(cacheKey, outputPath);
    if (hasMongoConfig()) {
      PracticeQuestion.updateOne(
        { subject: question.subject, questionId: question.id },
        { $set: { diagramPath } }
      ).catch(() => {});
    }
    return outputPath;
  }

  const imageMeta = await sharp(fullPagePath).metadata();
  const imageWidth = imageMeta.width || 0;
  const imageHeight = imageMeta.height || 0;

  const scaleX = imageWidth / question.cropHint.pageWidth;
  const scaleY = imageHeight / question.cropHint.pageHeight;

  const left = Math.max(0, Math.floor(question.cropHint.leftX * scaleX));
  const top = Math.max(0, Math.floor((question.cropHint.pageHeight - question.cropHint.upperY) * scaleY));
  const width = Math.max(80, Math.floor((question.cropHint.rightX - question.cropHint.leftX) * scaleX));
  const height = Math.max(120, Math.floor((question.cropHint.upperY - question.cropHint.lowerY) * scaleY));

  const safeWidth = Math.min(width, Math.max(1, imageWidth - left));
  const safeHeight = Math.min(height, Math.max(1, imageHeight - top));

  await sharp(fullPagePath)
    .extract({
      left,
      top,
      width: safeWidth,
      height: safeHeight
    })
    .toFile(outputPath);

  question.diagramPath = diagramPath;
  croppedImageCache.set(cacheKey, outputPath);
  if (hasMongoConfig()) {
    PracticeQuestion.updateOne(
      { subject: question.subject, questionId: question.id },
      { $set: { diagramPath } }
    ).catch(() => {});
  }
  return outputPath;
};

