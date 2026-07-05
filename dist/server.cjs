var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new import_genai.GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
};
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "15mb" }));
  app.get("/api/ai/status", (req, res) => {
    const hasKey = !!process.env.GEMINI_API_KEY;
    res.json({
      configured: hasKey,
      message: hasKey ? "AI features are active and connected." : "AI features are offline. Enter your GEMINI_API_KEY in 'Settings > Secrets' on Google AI Studio to enable AI optimization, summary suggestions, and ATS screening."
    });
  });
  app.post("/api/ai/generate-summary", async (req, res) => {
    try {
      const client = getGeminiClient();
      if (!client) {
        return res.status(503).json({
          error: "Gemini API key is not configured. Go to Secrets in Settings to provide your GEMINI_API_KEY."
        });
      }
      const { jobTitle, skills, experienceSummary } = req.body;
      if (!jobTitle) {
        return res.status(400).json({ error: "Job title is required." });
      }
      const prompt = `Write a compelling, professional, and ATS-friendly professional summary (2 to 4 sentences) for a resume. 
Target Job Title: ${jobTitle}
Key Skills: ${skills || "Not specified"}
Recent Work context / details: ${experienceSummary || "Not specified"}

Strict Guidelines:
1. Write in the active voice and professional format.
2. Ensure it is highly professional, and highlights impact and results.
3. Do not include markdown formatting like asterisks. Just return plain text summary.`;
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      const text = response.text || "";
      res.json({ summary: text.trim() });
    } catch (err) {
      console.error("Error in generate-summary:", err);
      res.status(500).json({ error: err.message || "Failed to generate summary with AI." });
    }
  });
  app.post("/api/ai/suggest-skills", async (req, res) => {
    try {
      const client = getGeminiClient();
      if (!client) {
        return res.status(503).json({
          error: "Gemini API key is not configured. Go to Secrets in Settings to provide your GEMINI_API_KEY."
        });
      }
      const { jobTitle } = req.body;
      if (!jobTitle) {
        return res.status(400).json({ error: "Job title is required to suggest skills." });
      }
      const prompt = `Generate standard, industry-relevant technical and soft skills for a ${jobTitle} portfolio.
Return the result strictly as a JSON object of this structure:
{
  "technical": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5", "Skill 6", "Skill 7", "Skill 8"],
  "soft": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"]
}

Format exactly as valid JSON. Do not wrap in markdown \`\`\`json blocks. Just output raw json.`;
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      const text = response.text || "{}";
      try {
        const parsed = JSON.parse(text);
        res.json(parsed);
      } catch (parseErr) {
        console.error("Parsing skills JSON failed, text output:", text);
        let cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        res.json(JSON.parse(cleanText));
      }
    } catch (err) {
      console.error("Error in suggest-skills:", err);
      res.status(500).json({ error: err.message || "Failed to generate skills suggestions." });
    }
  });
  app.post("/api/ai/generate-project-description", async (req, res) => {
    try {
      const client = getGeminiClient();
      if (!client) {
        return res.status(503).json({
          error: "Gemini API key is not configured. Go to Secrets in Settings to provide your GEMINI_API_KEY."
        });
      }
      const { projectName, technologiesUsed, briefGoal } = req.body;
      if (!projectName) {
        return res.status(400).json({ error: "Project name is required." });
      }
      const prompt = `Generate a professional, results-oriented, and ATS-friendly resume project description for:
Project Name: ${projectName}
Technologies: ${technologiesUsed || "Not specified"}
Brief functional details / goal: ${briefGoal || "Not specified"}

Format guidelines:
Write exactly three (3) highly professional, punchy bullet points, each starting with an active action verb (e.g. "Developed", "Architected", "Optimized"). 
Do not include any greeting or conversational fluff. Use plain hyphen bullets like:
- First bullet detailing architecture and main technology impact.
- Second bullet detailing optimization, state management, or secondary systems.
- Third bullet detailing developer metrics, responsiveness, user-facing results, or key metrics.`;
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      const text = response.text || "";
      res.json({ description: text.trim() });
    } catch (err) {
      console.error("Error in project description generation:", err);
      res.status(500).json({ error: err.message || "Failed to generate project bullets." });
    }
  });
  app.post("/api/ai/analyze-resume", async (req, res) => {
    try {
      const client = getGeminiClient();
      if (!client) {
        return res.status(503).json({
          error: "Gemini API key is not configured. Go to Secrets in Settings to provide your GEMINI_API_KEY."
        });
      }
      const { resumeData } = req.body;
      if (!resumeData) {
        return res.status(400).json({ error: "Resume data is required for analysis." });
      }
      const prompt = `You are an veteran HR recruiter and Technical Resume ATS (Applicant Tracking System) Screening expert.
Analyze the following resume structure and provide a candid grade, professional score, missing keywords, and detailed bullet suggestions for enhancement.

Resume Details to analyze:
${JSON.stringify(resumeData, null, 2)}

Provide your assessment STRICTLY as a valid JSON object matching this structure:
{
  "score": 85, // integer score from 0 to 100
  "atsScore": 8, // scale of 1-10 on ATS parsing risk (low margins, bad fonts, empty fields, formatting etc)
  "suggestions": [
    "Increase number of bullet points in work history to provide quantitative impact (e.g., %, $ saved).",
    "Add more specific technical keys corresponding to job title in skills list.",
    "Draft a professional summary instead of leaving it light."
  ],
  "missingKeywords": [
    "AWS",
    "System Design",
    "Unit Testing",
    "Agile Scrum"
  ],
  "keywordAnalysis": "Good core language tags present, but needs expansion in cloud storage, build steps, and quantitative indicators.",
  "critique": "A strong base, though the project list lacks explicit links or active verbs."
}

Format exactly as valid JSON. Do not wrap in markdown \`\`\`json blocks.`;
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      const text = response.text || "{}";
      try {
        const parsed = JSON.parse(text);
        res.json(parsed);
      } catch (parseErr) {
        console.error("Parsing analysis failed, fallback attempt:", text);
        let cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        res.json(JSON.parse(cleanText));
      }
    } catch (err) {
      console.error("Error in analyze-resume:", err);
      res.status(500).json({ error: err.message || "Failed to analyze resume structure." });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
