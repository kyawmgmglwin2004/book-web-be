import express from "express";
import {config} from "./configs/config.js";
import Mysql from "./helper/db.js"
import router from "./router.js";
import cors from "cors"
import path from "path"
import fs from "fs"



const app = express();
app.use("/uploads", express.static("uploads"));


const allowedOrigins = ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/",(req,res)=>{
  res.json("This is testing")
})
app.use("/api/v1", router);
app.get("/test", (req , res) => {
  console.log("Uplaods : ", req.params)
  res.send("KO kO")
})

app.get("/uploads", async (req, res) => {
  console.log("Uplaods : ", req.params)
  const fileName = req.params.filename;
  const filePath = path.join(__dirname, "uploads", fileName);
  console.log("filePath : ", req.params)

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.status(404).send({ message: "Check your file na  me!" });
    } else {
      res.sendFile(filePath);
    }
  });
});

console.log("App.JS port : ", config.PORT)

const PORT = config.PORT;
console.log("PORT : ", PORT)
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});