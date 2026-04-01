import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { seedDatabase } from "./seed";
import { spawn } from "child_process";
import { GoogleGenAI } from "@google/genai";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Seed the database on startup
  await seedDatabase();

  // ────────────────────────────────────────────
  // GET /api/lessons — all lessons with completion percentage
  // ────────────────────────────────────────────
  app.get("/api/lessons", async (_req, res) => {
    try {
      const allLessons = await storage.getAllLessons();
      const allProgress = await storage.getAllProgress();

      const lessonsWithProgress = await Promise.all(
        allLessons.map(async (lesson) => {
          const steps = await storage.getStepsByLessonId(lesson.id);
          const progressForLesson = allProgress.filter(
            (p) => p.lessonSlug === lesson.slug
          );
          const completedSteps = progressForLesson.filter((p) => p.completed).length;
          const totalSteps = steps.length;
          const completionPercent = totalSteps > 0
            ? Math.round((completedSteps / totalSteps) * 100)
            : 0;

          return {
            ...lesson,
            totalSteps,
            completedSteps,
            completionPercent,
          };
        })
      );

      // Sort by order
      lessonsWithProgress.sort((a, b) => a.order - b.order);

      res.json(lessonsWithProgress);
    } catch (err) {
      console.error("Error fetching lessons:", err);
      res.status(500).json({ message: "Ошибка при загрузке уроков" });
    }
  });

  // ────────────────────────────────────────────
  // GET /api/lessons/:slug — single lesson with steps and progress
  // ────────────────────────────────────────────
  app.get("/api/lessons/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const lesson = await storage.getLessonBySlug(slug);

      if (!lesson) {
        return res.status(404).json({ message: "Урок не найден" });
      }

      const steps = await storage.getStepsByLessonId(lesson.id);
      const progress = await storage.getProgressByLessonSlug(slug);

      // Sort steps by order
      steps.sort((a, b) => a.order - b.order);

      const stepsWithProgress = steps.map((step) => {
        const stepProgress = progress.find((p) => p.stepId === step.id);
        return {
          ...step,
          completed: stepProgress?.completed || false,
          userCode: stepProgress?.userCode || null,
          attempts: stepProgress?.attempts || 0,
        };
      });

      const completedSteps = stepsWithProgress.filter((s) => s.completed).length;
      const completionPercent = steps.length > 0
        ? Math.round((completedSteps / steps.length) * 100)
        : 0;

      res.json({
        ...lesson,
        steps: stepsWithProgress,
        totalSteps: steps.length,
        completedSteps,
        completionPercent,
      });
    } catch (err) {
      console.error("Error fetching lesson:", err);
      res.status(500).json({ message: "Ошибка при загрузке урока" });
    }
  });

  // ────────────────────────────────────────────
  // POST /api/progress — save progress for a step
  // ────────────────────────────────────────────
  app.post("/api/progress", async (req, res) => {
    try {
      const { lessonSlug, stepId, completed, userCode } = req.body;

      if (!lessonSlug || stepId === undefined) {
        return res.status(400).json({ message: "Отсутствуют обязательные поля" });
      }

      const result = await storage.upsertProgress({
        lessonSlug,
        stepId,
        completed: completed ?? false,
        userCode: userCode ?? null,
        attempts: 0,
      });

      res.json(result);
    } catch (err) {
      console.error("Error saving progress:", err);
      res.status(500).json({ message: "Ошибка при сохранении прогресса" });
    }
  });

  // ────────────────────────────────────────────
  // POST /api/run-code — execute Python code safely
  // ────────────────────────────────────────────
  app.post("/api/run-code", async (req, res) => {
    try {
      const { code } = req.body;

      if (!code || typeof code !== "string") {
        return res.status(400).json({ message: "Код не предоставлен" });
      }

      // Safety: limit code length
      if (code.length > 10000) {
        return res.status(400).json({ message: "Код слишком длинный" });
      }

      const result = await runPython(code);
      res.json(result);
    } catch (err) {
      console.error("Error running code:", err);
      res.status(500).json({ output: "", error: "Ошибка выполнения кода", exitCode: 1 });
    }
  });

  // ────────────────────────────────────────────
  // GET /api/stats — overall stats
  // ────────────────────────────────────────────
  app.get("/api/stats", async (_req, res) => {
    try {
      const allLessons = await storage.getAllLessons();
      const allProgress = await storage.getAllProgress();

      const completedSteps = allProgress.filter((p) => p.completed).length;
      const totalSteps = (await Promise.all(
        allLessons.map((l) => storage.getStepsByLessonId(l.id))
      )).reduce((sum, steps) => sum + steps.length, 0);

      const completedLessons = await Promise.all(
        allLessons.map(async (lesson) => {
          const steps = await storage.getStepsByLessonId(lesson.id);
          const progress = allProgress.filter((p) => p.lessonSlug === lesson.slug && p.completed);
          return steps.length > 0 && progress.length === steps.length;
        })
      );
      const completedLessonsCount = completedLessons.filter(Boolean).length;

      res.json({
        totalLessons: allLessons.length,
        completedLessons: completedLessonsCount,
        totalSteps,
        completedSteps,
        overallPercent: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
      res.status(500).json({ message: "Ошибка при загрузке статистики" });
    }
  });

  // ────────────────────────────────────────────
  // AI Teacher: Gemini API chat (no separate Python server needed)
  // ────────────────────────────────────────────
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
  let genai: InstanceType<typeof GoogleGenAI> | null = null;
  if (GEMINI_API_KEY) {
    genai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }

  const SYSTEM_PROMPT = `Ты — дружелюбный ИИ-учитель Python по имени Питоша. Ты помогаешь подростку 13-15 лет изучать Python.

ВАЖНЫЕ ПРАВИЛА:
- Говори на русском языке, простым и понятным языком
- Используй аналогии из игр, повседневной жизни и Scratch (ученик знает Scratch)
- Объясняй концепции пошагово, как терпеливый репетитор
- Если ученик спрашивает про код, давай примеры с комментариями на русском
- Поддерживай и хвали за хорошие вопросы
- Не давай готовых решений заданий — вместо этого наводи на правильный путь подсказками
- Ответы должны быть краткими (2-4 предложения), если не просят объяснить подробнее
- Используй эмодзи умеренно для дружелюбности (1-2 на сообщение)
- Если спрашивают не про Python и программирование — мягко верни к теме

КОНТЕКСТ УРОКА:
Ты видишь контекст текущего урока. Используй его для точных ответов.

Формат ответа: обычный текст (не markdown). Примеры кода оформляй как простой текст с отступами.`;

  app.post("/api/chat", async (req, res) => {
    try {
      if (!genai) {
        return res.status(503).json({ error: "ИИ-учитель не настроен (нет API-ключа)" });
      }

      const { message, lessonContext, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Сообщение пустое" });
      }

      // Build conversation contents for Gemini
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      // Add history
      if (history && Array.isArray(history)) {
        for (const msg of history.slice(-10)) {
          contents.push({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }],
          });
        }
      }

      // Add current message with lesson context
      const userText = lessonContext
        ? `[Контекст: ${lessonContext}]\n\n${message}`
        : message;
      contents.push({ role: "user", parts: [{ text: userText }] });

      const response = await genai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          maxOutputTokens: 500,
        },
      });

      const reply = response.text || "Извини, не получилось ответить. Попробуй ещё раз!";
      res.json({ reply });
    } catch (err: any) {
      console.error("Chat error:", err?.message || err);
      res.status(500).json({ error: "Ошибка при обработке сообщения" });
    }
  });

  // TTS is handled client-side via Web Speech API (speechSynthesis)
  // No server endpoint needed — this saves API costs and complexity

  return httpServer;
}

// ────────────────────────────────────────────
// Helper: Run Python code safely with timeout
// ────────────────────────────────────────────
function runPython(code: string): Promise<{ output: string; error: string; exitCode: number }> {
  return new Promise((resolve) => {
    let output = "";
    let error = "";
    let settled = false;

    const proc = spawn("python3", ["-c", code], {
      timeout: 5000,
    });

    proc.stdout.on("data", (data) => {
      output += data.toString();
    });

    proc.stderr.on("data", (data) => {
      error += data.toString();
    });

    const finish = (exitCode: number) => {
      if (settled) return;
      settled = true;
      // Limit output length
      if (output.length > 5000) output = output.slice(0, 5000) + "\n... (вывод обрезан)";
      if (error.length > 2000) error = error.slice(0, 2000) + "\n... (ошибка обрезана)";
      resolve({ output: output.trim(), error: error.trim(), exitCode });
    };

    proc.on("close", (code) => {
      finish(code ?? 0);
    });

    proc.on("error", (err) => {
      settled = true;
      resolve({ output: "", error: `Ошибка запуска Python: ${err.message}`, exitCode: 1 });
    });

    // Kill after 5 seconds
    setTimeout(() => {
      if (!settled) {
        proc.kill("SIGKILL");
        resolve({ output: output.trim(), error: "Превышено время ожидания (5 сек). Возможно, бесконечный цикл?", exitCode: 124 });
      }
    }, 5000);
  });
}
