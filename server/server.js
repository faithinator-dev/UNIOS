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

// Health check route
app.get("/", (req, res) => {
  res.send("UNIOS Backend is Live!");
});

// Main AI Route
app.post("/chat", async (req, res) => {
  try {
    const { page, input } = req.body;

    let prompt = "";

    switch (page) {
      case "Chat Brain":
        prompt = `
You are Chat Brain.

Help the user with:
- Planning schedules
- Writing emails
- Brainstorming ideas

User Request:
${input}
`;
        break;

      case "StudyBuddy":
        prompt = `
You are StudyBuddy.

Convert the following content into:

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

Analyze the code below.

Return:
1. Error Explanation
2. Fixed Code
3. Best Practice

Code:
${input}
`;
        break;

      case "ELI5 Tutor":
        prompt = `
Explain the following topic as if teaching a 10-year-old.

Include:
1. Simple Explanation
2. Real-Life Example
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

    res.status(200).json({
      success: true,
      message: response.output_text,
    });
  } catch (error) {
    console.error("SERVER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong on the server.",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`UNIOS server running on port ${PORT}`);
});