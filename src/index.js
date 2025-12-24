import express from "express";
import { config } from "./configs/config.js";
import Mysql from "./helper/db.js";
import router from "./router.js";
import cors from "cors";
import path from "path";
import fs from "fs";
import https from "https";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve uploads folder statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Enable CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get("/", (req, res) => {
  res.json("This is testing");
});

// API routes
app.use("/api/v1", router);

// Test route
app.get("/test", (req, res) => {
  console.log("Test route accessed");
  res.send("Test OK");
});

// Serve uploaded files by filename
app.get("/uploads/:filename", async (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(__dirname, "uploads", fileName);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.status(404).send({ message: "File not found!" });
    } else {
      res.sendFile(filePath);
    }
  });
});

// SSL options
const sslOptions = {
  key: fs.readFileSync("/etc/letsencrypt/live/book.kyawmgmglwin.site/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/book.kyawmgmglwin.site/fullchain.pem"),
};

// Start HTTPS server
const PORT = config.PORT || 5000;
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`HTTPS Server running on https://localhost:${PORT}`);
});
