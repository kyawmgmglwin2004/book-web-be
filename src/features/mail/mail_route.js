import { Router } from "express"; // ⚠️ router npm package မဟုတ်ဘူး
import sendOrder from "./mail_controller.js";

const mailRouter = Router();

mailRouter.post("/mail", sendOrder);

export default mailRouter;