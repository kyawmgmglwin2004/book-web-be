import express from "express";
import {config} from "./configs/config.js";
import Mysql from "./helper/db.js"
import router from "./router.js";
import cors from "cors"
import path from "path"
import fs from "fs"
import https from "https";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Serve uploaded files from the uploads directory (absolute path)
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));


// const allowedOrigins = ["*"];

app.use(
  cors()
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/",(req,res)=>{
  res.json("This is testing")
})
app.use("/api/v1", router);
app.get("/test", (req , res) => {
  console.log("Uploads : ", req.params)
  res.send("KO kO")
})

console.log("App.JS port : ", config.PORT)

const sslOptions = {
  key: fs.readFileSync("/etc/letsencrypt/live/book.kyawmgmglwin.site/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/book.kyawmgmglwin.site/fullchain.pem"),
};

// Start HTTPS server
const PORT = config.PORT || 5000;
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`HTTPS Server running on https://localhost:${PORT}`);
});