import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";



dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("Backend is working!");
});

app.post("/chat", async (req, res) => {
  const { page, input } = req.body;

  let prompt = "";

  if (page === "ELI5 Tutor") {
    prompt = `
    Explain "${input}" to a 10-year-old.

    Include:
    - Simple explanation
    - Example
    - Fun fact
    `;
  }

  if (page === "Codex Debugger") {
    prompt = `
    Debug this code:

    ${input}

    Return:
    1. Error Explanation
    2. Fixed Code
    3. Best Practice
    `;
  }

  const response = await client.responses.create({
    model: "gpt-5",
    input: prompt,
  });

  res.json({
    message: response.output_text,
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;