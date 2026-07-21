import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

/* -------------------------------------------------------------------------- */
/*                                Configuration                               */
/* -------------------------------------------------------------------------- */

const PORT = process.env.PORT || 5000;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o";
const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-2.5-flash";

app.use(cors());
app.use(express.json({ limit: "1mb" }));

console.log("========== UNIOS STARTUP ==========");
console.log("PORT:", PORT);
console.log(
  "OPENAI:",
  process.env.OPENAI_API_KEY ? "FOUND" : "MISSING"
);
console.log(
  "GEMINI:",
  process.env.GEMINI_API_KEY ? "FOUND" : "MISSING"
);
console.log("===================================");

/* -------------------------------------------------------------------------- */
/*                                 AI Clients                                 */
/* -------------------------------------------------------------------------- */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/* -------------------------------------------------------------------------- */
/*                                  Prompts                                   */
/* -------------------------------------------------------------------------- */

const prompts = {
  "Chat Brain": (input) => `
You are Chat Brain.

Help users:
- Plan schedules
- Write emails
- Brainstorm ideas

User:
${input}
`,

  StudyBuddy: (input) => `
You are StudyBuddy.

Generate:
1. Notes
2. Flashcards
3. Quiz Questions

Content:
${input}
`,

  "Codex Debugger": (input) => `
You are a senior software engineer.

Return:
1. Error Explanation
2. Fixed Code
3. Best Practice

Code:
${input}
`,

  "ELI5 Tutor": (input) => `
Explain this to a 10-year-old.

Include:
1. Simple Explanation
2. Example
3. Fun Fact

Topic:
${input}
`,
};

const demoResponses = {
  "Chat Brain":
    "Monday: Learn React\nTuesday: Build Projects\nWednesday: Study Node.js",

  StudyBuddy:
    "NOTES:\nReact is a JavaScript library.\n\nFLASHCARDS:\nQ: What is React?\nA: A UI library.",

  "Codex Debugger":
    'ERROR:\n"name" is not defined.\n\nFIXED:\nconst name = "Faith";',

  "ELI5 Tutor":
    "JavaScript is the brain of a website. It makes buttons and pages interactive.",
};

/* -------------------------------------------------------------------------- */
/*                               Helper Methods                               */
/* -------------------------------------------------------------------------- */

function buildPrompt(page, messages) {
  const history = messages
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join("\n");

  switch (page) {
    case "Chat Brain":
      return `
You are Chat Brain.

Help users:
- Plan schedules
- Write emails
- Brainstorm ideas

Conversation:
${history}
`;
    case "StudyBuddy":
      return `
You are StudyBuddy.

Generate:
1. Notes
2. Flashcards
3. Quiz Questions

Conversation:
${history}
`;
    case "Codex Debugger":
      return `
You are a senior software engineer.

Return:
1. Error Explanation
2. Fixed Code
3. Best Practice

Conversation:
${history}
`;
    case "ELI5 Tutor":
      return `
Explain things to a 10-year-old.

Include:
1. Simple Explanation
2. Examples
3. Fun Facts

Conversation:
${history}
`;
    default:
      return history;
  }
}

async function askOpenAI(prompt) {
  const response = await openai.responses.create({
    model: OPENAI_MODEL,
    input: prompt,
  });

  return response.output_text;
}

async function askGemini(prompt) {
  const response = await gemini.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
  });

  return response.text;
}

async function askAI(prompt) {
  // OpenAI
  try {
    const message = await askOpenAI(prompt);

    return {
      provider: "OpenAI",
      message,
    };
  } catch (error) {
    console.log("OpenAI Failed:", error.code);

    // Gemini
    try {
      const message = await askGemini(prompt);

      return {
        provider: "Gemini",
        message,
      };
    } catch (geminiError) {
      console.log(
        "Gemini Failed:",
        geminiError.message
      );

      return {
        provider: "Demo Mode",
        message:
          "UNIOS is currently running in Demo Mode.",
      };
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                                   Routes                                   */
/* -------------------------------------------------------------------------- */

app.get("/", (req, res) => {
  res.json({
    success: true,
    name: "UNIOS",
    message: "UNIOS Backend is Live!",
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    uptime: Math.round(process.uptime()),
  });
});

app.get("/test-openai", async (req, res) => {
  try {
    const response = await askOpenAI("Say hello.");

    res.json({
      provider: "OpenAI",
      message: response,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.get("/test-gemini", async (req, res) => {
  try {
    const response = await askGemini("Say hello.");

    res.json({
      provider: "Gemini",
      message: response,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.post("/chat", async (req, res) => {
  try {
    const { page, messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Messages are required.",
      });
    }

    const prompt = buildPrompt(page, messages);

    const result = await askAI(prompt);

    if (result.provider === "Demo Mode") {
      return res.json({
        success: true,
        provider: "Demo Mode",
        demoMode: true,
        message:
          demoResponses[page] ||
          "UNIOS is currently running in Demo Mode.",
      });
    }

    res.json({
      success: true,
      provider: result.provider,
      demoMode: false,
      message: result.message,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* -------------------------------------------------------------------------- */
/*                                Error Routes                                */
/* -------------------------------------------------------------------------- */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found.",
  });
});

/* -------------------------------------------------------------------------- */
/*                                  Startup                                   */
/* -------------------------------------------------------------------------- */

app.listen(PORT, () => {
  console.log(
    `🚀 UNIOS Server running at http://localhost:${PORT}`
  );
});