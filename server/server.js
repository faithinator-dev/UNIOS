import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Health Check
app.get("/", (req, res) => {
  res.send("UNIOS Backend is Live!");
});

// Chat Endpoint
app.post("/chat", async (req, res) => {
  try {
    const { page, input } = req.body;

    let prompt = "";

    switch (page) {
      case "Chat Brain":
        prompt = `
You are Chat Brain.

Help the user:
- Plan schedules
- Write emails
- Brainstorm ideas

User Input:
${input}
`;
        break;

      case "StudyBuddy":
        prompt = `
You are StudyBuddy.

Convert the content into:
1. Notes
2. Flashcards
3. Quiz Questions

Content:
${input}
`;
        break;

      case "Codex Debugger":
        prompt = `
You are a senior software engineer.

Analyze this code and return:
1. Error Explanation
2. Fixed Code
3. Best Practice

Code:
${input}
`;
        break;

      case "ELI5 Tutor":
        prompt = `
Explain the following topic to a 10-year-old.

Include:
1. Simple Explanation
2. Example
3. Fun Fact

Topic:
${input}
`;
        break;

      default:
        prompt = input;
    }

    const response = await client.responses.create({
      model: "gpt-5",
      input: prompt,
    });

    res.json({
      success: true,
      message: response.output_text,
    });
  } catch (error) {
    console.error("SERVER ERROR:", error);

    // Demo Mode Fallback
    if (error.code === "insufficient_quota") {
      console.log("RUNNING IN DEMO MODE");

      switch (req.body.page) {
        case "Chat Brain":
          return res.json({
            success: true,
            message: `
DEMO MODE

Weekly Plan:

Monday - Learn React
Tuesday - Build Projects
Wednesday - Study Node.js
Thursday - Practice APIs
Friday - Review Progress
            `,
          });

        case "StudyBuddy":
          return res.json({
            success: true,
            message: `
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
          });

        case "Codex Debugger":
          return res.json({
            success: true,
            message: `
DEMO MODE

ERROR:
'name' is not defined.

FIXED CODE:

const name = "Faith";
console.log(name);

BEST PRACTICE:
Always initialize variables before using them.
            `,
          });

        case "ELI5 Tutor":
          return res.json({
            success: true,
            message: `
DEMO MODE

JavaScript is like the brain of a website.

Without it, buttons would not work and pages would not respond to users.

Fun Fact:
Almost every modern website uses JavaScript!
            `,
          });

        default:
          return res.json({
            success: true,
            message:
              "UNIOS is currently running in Demo Mode. OpenAI credits will be added soon.",
          });
      }
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`UNIOS Server running on port ${PORT}`);
});