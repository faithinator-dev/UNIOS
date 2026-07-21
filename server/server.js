import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createRequire } from "node:module";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MODEL = process.env.OPENAI_MODEL || "gpt-5";
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const require = createRequire(import.meta.url);
const OpenAI = require("openai");
let client;

const modulePrompts = {
  "Chat Brain": (input) => `
You are Chat Brain.

Help the user:
- Plan schedules
- Write emails
- Brainstorm ideas

User Input:
${input}
`,
  StudyBuddy: (input) => `
You are StudyBuddy.

Convert the content into:
1. Notes
2. Flashcards
3. Quiz Questions

Content:
${input}
`,
  "Codex Debugger": (input) => `
You are a senior software engineer.

Analyze this code and return:
1. Error Explanation
2. Fixed Code
3. Best Practice

Code:
${input}
`,
  "ELI5 Tutor": (input) => `
Explain the following topic to a 10-year-old.

Include:
1. Simple Explanation
2. Example
3. Fun Fact

Topic:
${input}
`,
};

const demoResponses = {
  "Chat Brain": `
DEMO MODE

Weekly Plan:

Monday - Learn React
Tuesday - Build Projects
Wednesday - Study Node.js
Thursday - Practice APIs
Friday - Review Progress
`,
  StudyBuddy: `
DEMO MODE

NOTES:
- React is a JavaScript library for building user interfaces.

FLASHCARDS:
Q: What is React?
A: A JavaScript library.

QUIZ:
1. Who developed React?
2. What are components?
`,
  "Codex Debugger": `
DEMO MODE

ERROR:
'name' is not defined.

FIXED CODE:

const name = "Faith";
console.log(name);

BEST PRACTICE:
Always initialize variables before using them.
`,
  "ELI5 Tutor": `
DEMO MODE

JavaScript is like the brain of a website.

Without it, buttons would not work and pages would not respond to users.

Fun Fact:
Almost every modern website uses JavaScript!
`,
};

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
    );
  });

  next();
});

function createHttpError(status, message, code = "REQUEST_ERROR") {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function buildPrompt(page, input) {
  const promptBuilder = modulePrompts[page];
  return promptBuilder ? promptBuilder(input) : input;
}

function getDemoResponse(page) {
  return (
    demoResponses[page] ||
    "UNIOS is currently running in Demo Mode. OpenAI credits will be added soon."
  ).trim();
}

function shouldUseDemoMode(error) {
  if (
    error?.status >= 400 &&
    error?.status < 500 &&
    error.status !== 401 &&
    error.status !== 429
  ) {
    return false;
  }

  return (
    process.env.DEMO_MODE === "true" ||
    !process.env.OPENAI_API_KEY ||
    error?.code === "insufficient_quota" ||
    error?.status === 401 ||
    error?.status === 429
  );
}

function logError(error, context = {}) {
  console.error("SERVER ERROR:", {
    message: error.message,
    code: error.code,
    status: error.status,
    ...context,
  });
}

function getOpenAIClient() {
  if (!client) {
    client = new OpenAI({
      apiKey: `Bearer ${process.env.OPENAI_API_KEY}`,
    });
  }

  return client;
}

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "UNIOS Backend is Live!",
    service: "unios-api",
    demoMode: process.env.DEMO_MODE === "true" || !process.env.OPENAI_API_KEY,
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.post("/chat", async (req, res, next) => {
  const { page, input } = req.body || {};

  try {
    if (typeof input !== "string" || input.trim().length === 0) {
      throw createHttpError(400, "Input is required.", "INVALID_INPUT");
    }

    if (input.length > 12000) {
      throw createHttpError(
        413,
        "Input is too long. Please shorten it and try again.",
        "INPUT_TOO_LONG"
      );
    }

    if (process.env.DEMO_MODE === "true" || !process.env.OPENAI_API_KEY) {
      return res.json({
        success: true,
        message: getDemoResponse(page),
        demoMode: true,
      });
    }

    const response = await getOpenAIClient().responses.create({
      model: MODEL,
      input: buildPrompt(page, input.trim()),
    });

    return res.json({
      success: true,
      message: response.output_text,
      demoMode: false,
    });
  } catch (error) {
    if (shouldUseDemoMode(error)) {
      logError(error, { route: "/chat", page, fallback: "demo" });

      return res.json({
        success: true,
        message: getDemoResponse(page),
        demoMode: true,
      });
    }

    return next(error);
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found.",
    code: "NOT_FOUND",
  });
});

app.use((error, req, res, next) => {
  const status = error.status || 500;

  logError(error, {
    method: req.method,
    path: req.originalUrl,
  });

  res.status(status).json({
    success: false,
    message:
      status >= 500 && IS_PRODUCTION
        ? "Something went wrong. Please try again."
        : error.message,
    code: error.code || "SERVER_ERROR",
  });
});

app.listen(PORT, () => {
  console.log(`UNIOS Server running on port ${PORT}`);
});
