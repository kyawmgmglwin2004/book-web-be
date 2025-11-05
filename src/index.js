import express from "express";
import {config} from "./configs/config.js";
import Mysql from "./helper/db.js"
import router from "./router.js";
import cors from "cors"

const app = express();
const con = await Mysql.getConnection();
// console.log("con ", con)


const allowedOrigins = ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", router);
app.get("/test", (req , res) => {
  res.send("KO kO")
})

const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});