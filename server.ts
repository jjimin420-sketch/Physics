import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { 
  INITIAL_ASSIGNMENTS, 
  INITIAL_SUBMISSIONS, 
  INITIAL_VIDEOS, 
  INITIAL_QUIZZES, 
  INITIAL_QUIZ_ATTEMPTS,
  INITIAL_USERS 
} from "./src/data/initialData";
import { INITIAL_FORUM_QUESTIONS } from "./src/data/extendedData";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limits for direct video and media uploads
  app.use(express.json({ limit: "150mb" }));
  app.use(express.urlencoded({ limit: "150mb", extended: true }));

  // Ensure storage directories exist
  const uploadsDir = path.join(process.cwd(), "uploads");
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const storageFile = path.join(dataDir, "portal-storage.json");

  const getInitialDatabase = () => ({
    videos: INITIAL_VIDEOS,
    assignments: INITIAL_ASSIGNMENTS,
    submissions: INITIAL_SUBMISSIONS,
    quizzes: INITIAL_QUIZZES,
    quizAttempts: INITIAL_QUIZ_ATTEMPTS,
    forumQuestions: INITIAL_FORUM_QUESTIONS,
    users: INITIAL_USERS,
    lastModified: Date.now()
  });

  // Read stored data, self-healing with seed data if not present
  const readData = () => {
    try {
      if (fs.existsSync(storageFile)) {
        const raw = fs.readFileSync(storageFile, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          return {
            videos: Array.isArray(parsed.videos) ? parsed.videos : INITIAL_VIDEOS,
            assignments: Array.isArray(parsed.assignments) ? parsed.assignments : INITIAL_ASSIGNMENTS,
            submissions: Array.isArray(parsed.submissions) ? parsed.submissions : INITIAL_SUBMISSIONS,
            quizzes: Array.isArray(parsed.quizzes) ? parsed.quizzes : INITIAL_QUIZZES,
            quizAttempts: Array.isArray(parsed.quizAttempts) ? parsed.quizAttempts : INITIAL_QUIZ_ATTEMPTS,
            forumQuestions: Array.isArray(parsed.forumQuestions) ? parsed.forumQuestions : INITIAL_FORUM_QUESTIONS,
            users: Array.isArray(parsed.users) ? parsed.users : INITIAL_USERS,
            lastModified: parsed.lastModified || Date.now()
          };
        }
      }
    } catch (e) {
      console.error("Failed to read storage file:", e);
    }
    const initial = getInitialDatabase();
    writeData(initial);
    return initial;
  };

  // Write stored data
  const writeData = (data: any) => {
    try {
      data.lastModified = Date.now();
      fs.writeFileSync(storageFile, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to write storage file:", e);
    }
  };

  // Seed storage initially if needed
  readData();

  // Custom static handler for uploaded videos supporting HTTP 206 Partial Content (Range requests)
  // This is required for iOS Safari, iPadOS, Chrome, and QuickTime media seeking
  app.use("/uploads/:filename", (req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      return next();
    }

    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send("File not found");
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    const ext = path.extname(filePath).toLowerCase();
    const mimeMap: Record<string, string> = {
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".mov": "video/quicktime",
      ".m4v": "video/x-m4v",
      ".ogg": "video/ogg",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".pdf": "application/pdf"
    };
    const contentType = mimeMap[ext] || "video/mp4";

    // Set CORS and byte range acceptance headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Range, Origin, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Cache-Control", "public, max-age=86400");

    if (range) {
      // Parse Range header: bytes=start-end, bytes=start-, or bytes=-suffix
      const matches = range.match(/bytes=(\d*)-(\d*)/);
      if (!matches) {
        res.setHeader("Content-Range", `bytes */${fileSize}`);
        return res.status(416).send("Requested Range Not Satisfiable");
      }

      let start = matches[1] ? parseInt(matches[1], 10) : NaN;
      let end = matches[2] ? parseInt(matches[2], 10) : NaN;

      if (isNaN(start) && !isNaN(end)) {
        // Suffix range: bytes=-500 -> last 500 bytes (common on iOS Safari / QuickTime)
        start = Math.max(0, fileSize - end);
        end = fileSize - 1;
      } else if (!isNaN(start) && isNaN(end)) {
        // Open ended range: bytes=500- -> from 500 to EOF
        end = fileSize - 1;
      }

      if (isNaN(start) || isNaN(end) || start < 0 || start >= fileSize || end < start) {
        res.setHeader("Content-Range", `bytes */${fileSize}`);
        return res.status(416).send("Requested Range Not Satisfiable");
      }

      if (end >= fileSize) {
        end = fileSize - 1;
      }

      const chunkSize = end - start + 1;
      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Content-Length": chunkSize,
        "Content-Type": contentType,
      });

      if (req.method === "HEAD") {
        return res.end();
      }

      const stream = fs.createReadStream(filePath, { start, end });
      stream.on("error", (err) => {
        console.error("Video stream read error:", err);
        if (!res.headersSent) res.status(500).end();
      });
      stream.pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": contentType,
      });

      if (req.method === "HEAD") {
        return res.end();
      }

      const stream = fs.createReadStream(filePath);
      stream.on("error", (err) => {
        console.error("Video stream read error:", err);
        if (!res.headersSent) res.status(500).end();
      });
      stream.pipe(res);
    }
  });

  // Serve static uploaded videos and attachments fallback
  app.use("/uploads", express.static(uploadsDir));

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Raw Binary Streaming Upload endpoint
  // Direct stream from client - handles small and large files (up to 500MB+) with low memory
  app.post("/api/upload-stream", (req, res) => {
    try {
      const rawFilename = (req.query.filename as string) || (req.headers["x-filename"] as string) || "video.mp4";
      const sanitizedName = decodeURIComponent(rawFilename).replace(/[^a-zA-Z0-9._-]/g, "_");
      const uniqueName = `${Date.now()}_${sanitizedName}`;
      const filePath = path.join(uploadsDir, uniqueName);

      const writeStream = fs.createWriteStream(filePath);
      let sizeBytes = 0;

      req.on("data", (chunk) => {
        sizeBytes += chunk.length;
      });

      req.pipe(writeStream);

      writeStream.on("finish", () => {
        const fileUrl = `/uploads/${uniqueName}`;
        const sizeFormatted = sizeBytes > 1024 * 1024
          ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
          : `${(sizeBytes / 1024).toFixed(0)} KB`;

        console.log(`[Stream Upload] Successfully stored: ${uniqueName} (${sizeFormatted})`);
        res.json({
          success: true,
          url: fileUrl,
          filename: uniqueName,
          originalName: rawFilename,
          fileSize: sizeFormatted,
          sizeBytes
        });
      });

      writeStream.on("error", (err) => {
        console.error("[Stream Upload Error]:", err);
        res.status(500).json({ error: "Failed to write stream to file" });
      });
    } catch (error: any) {
      console.error("[Stream Upload Exception]:", error);
      res.status(500).json({ error: error.message || "Failed to process streaming upload" });
    }
  });

  // Upload Video / File endpoint (JSON Base64 fallback)
  app.post("/api/upload", (req, res) => {
    try {
      const { filename, fileType, dataUrl } = req.body;
      if (!filename || !dataUrl) {
        return res.status(400).json({ error: "Filename and dataUrl are required" });
      }

      // Extract base64 payload
      const matches = dataUrl.match(/^data:([A-Za-z-+\/0-9.]+);base64,(.+)$/);
      let buffer: Buffer;

      if (matches && matches[2]) {
        buffer = Buffer.from(matches[2], "base64");
      } else {
        buffer = Buffer.from(dataUrl, "base64");
      }

      const sanitizedName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
      const uniqueName = `${Date.now()}_${sanitizedName}`;
      const filePath = path.join(uploadsDir, uniqueName);

      fs.writeFileSync(filePath, buffer);

      const fileUrl = `/uploads/${uniqueName}`;
      const sizeBytes = buffer.length;
      const sizeFormatted = sizeBytes > 1024 * 1024
        ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
        : `${(sizeBytes / 1024).toFixed(0)} KB`;

      console.log(`[Upload] Successfully stored: ${uniqueName} (${sizeFormatted})`);

      return res.json({
        success: true,
        url: fileUrl,
        filename: uniqueName,
        originalName: filename,
        fileType: fileType || "video/mp4",
        fileSize: sizeFormatted,
        sizeBytes
      });
    } catch (error: any) {
      console.error("[Upload Error]:", error);
      return res.status(500).json({ error: error.message || "Failed to upload file" });
    }
  });

  // Get all videos endpoint
  app.get("/api/videos", (_req, res) => {
    const data = readData();
    res.json(data.videos || []);
  });

  // Create video endpoint (stores on server so all devices can see it!)
  app.post("/api/videos", (req, res) => {
    try {
      const video = req.body;
      if (!video || !video.title || !video.videoUrl) {
        return res.status(400).json({ error: "Missing required video fields" });
      }

      const data = readData();
      const currentVideos = data.videos || [];
      const updatedVideos = [video, ...currentVideos.filter((v: any) => v.id !== video.id)];
      data.videos = updatedVideos;
      writeData(data);

      console.log(`[Video Added] "${video.title}" saved. Total videos: ${updatedVideos.length}`);
      res.json({ success: true, video, total: updatedVideos.length, lastModified: data.lastModified });
    } catch (error: any) {
      console.error("[Create Video Error]:", error);
      res.status(500).json({ error: error.message || "Failed to save video" });
    }
  });

  // Delete video endpoint
  app.delete("/api/videos/:id", (req, res) => {
    try {
      const videoId = req.params.id;
      const data = readData();
      const currentVideos = data.videos || [];
      const target = currentVideos.find((v: any) => v.id === videoId);

      if (target && target.videoUrl && target.videoUrl.startsWith("/uploads/")) {
        const localFileName = target.videoUrl.replace("/uploads/", "");
        const localFilePath = path.join(uploadsDir, localFileName);
        if (fs.existsSync(localFilePath)) {
          try {
            fs.unlinkSync(localFilePath);
            console.log(`[Cleanup] Deleted file: ${localFileName}`);
          } catch (e) {
            console.warn("Could not delete file:", e);
          }
        }
      }

      data.videos = currentVideos.filter((v: any) => v.id !== videoId);
      writeData(data);

      res.json({ success: true, id: videoId, lastModified: data.lastModified });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Lightweight check for data version across devices
  app.get("/api/portal-version", (_req, res) => {
    const data = readData();
    res.json({ lastModified: data.lastModified || 0 });
  });

  // Get full synchronized portal data (for multi-device sync)
  app.get("/api/portal-data", (_req, res) => {
    const data = readData();
    res.json(data);
  });

  // Save/Sync portal data
  app.post("/api/portal-data", (req, res) => {
    try {
      const payload = req.body;
      const current = readData();
      const merged = { ...current, ...payload, lastModified: Date.now() };
      writeData(merged);
      res.json({ success: true, lastModified: merged.lastModified });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Physics Learning Portal server listening on port ${PORT}`);
  });
}

startServer();
