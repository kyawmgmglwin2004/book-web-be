import { Router } from "express";
import books from "./features/books/book_route.js";
import mail from "./features/mail/mail_route.js";

const router = Router();

router.use("/", books);

router.use("/orders", mail);

export default router;