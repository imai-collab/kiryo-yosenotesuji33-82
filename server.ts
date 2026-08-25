import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const PROBLEMS_FILE = path.join(DATA_DIR, "problems.json");
const INITIAL_PROBLEMS_FILE = path.join(process.cwd(), "src", "data", "problems.json");

const DATASETS_FILE = path.join(DATA_DIR, "datasets.json");
const INITIAL_DATASETS_FILE = path.join(process.cwd(), "src", "data", "datasets.json");

const ANSWER_IMAGES_FILE = path.join(DATA_DIR, "answer_images.json");

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Ensure data directory exists
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (e) {}

  // API routes
  app.get("/api/problems", async (req, res) => {
    try {
      try {
        const data = await fs.readFile(PROBLEMS_FILE, "utf-8");
        return res.json(JSON.parse(data));
      } catch {
        const data = await fs.readFile(INITIAL_PROBLEMS_FILE, "utf-8");
        return res.json(JSON.parse(data));
      }
    } catch (e) {
      res.json([]);
    }
  });

  app.post("/api/problems", async (req, res) => {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      const problems = req.body;
      await fs.writeFile(PROBLEMS_FILE, JSON.stringify(problems, null, 2), "utf-8");
      res.json({ success: true });
    } catch (e) {
      console.error("Failed to save problems:", e);
      res.status(500).json({ error: "Failed to save problems" });
    }
  });

  app.get("/api/datasets", async (req, res) => {
    try {
      try {
        const data = await fs.readFile(DATASETS_FILE, "utf-8");
        return res.json(JSON.parse(data));
      } catch {
        const data = await fs.readFile(INITIAL_DATASETS_FILE, "utf-8");
        return res.json(JSON.parse(data));
      }
    } catch (e) {
      res.json([]);
    }
  });

  app.post("/api/datasets", async (req, res) => {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      const datasets = req.body;
      await fs.writeFile(DATASETS_FILE, JSON.stringify(datasets, null, 2), "utf-8");
      res.json({ success: true });
    } catch (e) {
      console.error("Failed to save datasets:", e);
      res.status(500).json({ error: "Failed to save datasets" });
    }
  });

  app.get("/api/answer-images", async (req, res) => {
    try {
      const data = await fs.readFile(ANSWER_IMAGES_FILE, "utf-8");
      return res.json(JSON.parse(data));
    } catch (e) {
      res.json({});
    }
  });

  app.post("/api/answer-images", async (req, res) => {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      const imagesMap = req.body;
      await fs.writeFile(ANSWER_IMAGES_FILE, JSON.stringify(imagesMap, null, 2), "utf-8");
      res.json({ success: true });
    } catch (e) {
      console.error("Failed to save answer images:", e);
      res.status(500).json({ error: "Failed to save answer images" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
