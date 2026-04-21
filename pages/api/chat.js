import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function loadKnowledgeBase() {
  const dir = path.join(process.cwd(), "knowledge");
  if (!fs.existsSync(dir)) return "(belum ada knowledge base)";
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".txt"));
  if (files.length === 0) return "(belum ada file .txt di folder knowledge)";
  return files
    .map((f) => {
      const content = fs.readFileSync(path.join(dir, f), "utf-8");
      return `=== SUMBER: ${f} ===\n${content}`;
    })
    .join("\n\n");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { messages } = req.body;
  if (!messages?.length) return res.status(400).json({ error: "No messages" });

  const knowledge = loadKnowledgeBase();

  const systemPrompt = `Kamu adalah IT Application Support AI Assistant yang ahli dan sangat membantu.
Tugasmu adalah membantu tim IT support menyelesaikan masalah teknis berdasarkan knowledge base berikut.

PANDUAN MENJAWAB:
- Jawab HANYA berdasarkan knowledge base yang tersedia
- Jika tidak ada di knowledge base, katakan jujur dan sarankan escalate ke senior
- Gunakan bahasa Indonesia yang jelas dan mudah dipahami
- Untuk kode error: jelaskan penyebab + langkah solusi step-by-step
- Untuk kode program/command: tampilkan dalam format kode
- Jika ada beberapa kemungkinan masalah, tanyakan info tambahan

KNOWLEDGE BASE:
${knowledge}`;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: systemPrompt,
    });

    // Konversi format messages ke format Gemini
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1].content;

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage);
    const reply = result.response.text();

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI error: " + err.message });
  }
}
