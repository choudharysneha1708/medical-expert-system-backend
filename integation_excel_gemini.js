const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = 3000;
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GENAI_API_KEY);
app.use(cors());
app.use(express.json());

// Route handler for the root path ("/")
app.get("/", (req, res) => {
  res.send(
    "Server is running. Please use the /user endpoint to submit user data."
  );
});

// Route to handle user input
app.post("/user", async (req, res) => {
  try {
    // Extract personal information from the request body
    const { age, gender, symptoms } = req.body;
    console.log("Received user data:", { age, gender, symptoms });

    // Save user details to Excel sheet
    // await saveUserToExcel({ age, gender, symptoms });

    // const prompt = `I have ${symptoms.join(
    //   ", "
    // )} symptoms. What are the precautions I need to take? write response in 150 words`;

    const prompt =
      symptoms.length > 0
        ? `I have ${symptoms.join(
            ", "
          )} symptoms. What are the precautions I need to take? write response in 150 words`
        : "No symptoms provided.";

    // Generate content using Google Generative AI
    const precaution = await generatePrecaution(prompt);
    let finalString = "";
    precaution.forEach((c) => {
      if (c != "*") finalString += c;
    });
    // Send a response to the client
    res.send(
      `${finalString}`
    );
  } catch (error) {
    console.error("Error handling user data:", error);
    res.status(500).send("Error handling user data.");
  }
});
const directoryPath = "./";
fs.access(directoryPath, fs.constants.W_OK, (err) => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  // }
});
async function generatePrecaution(prompt) {
  try {
    const generationConfig = {
      stopSequences: ["red"],
      maxOutputTokens: 200,
      temperature: 0.9,
      topP: 0.1,
      topK: 16,
    };
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({
      model: "gemini-pro"
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response
      .text()
      .split("\n")
      .filter((line) => line.trim() !== ""); 
    console.log(text);
    return text;
  } catch (error) {
    console.error("Error generating precaution:", error);
    // In generatePrecaution function
    return ["Error generating precaution: " + error.message];
  }
}

