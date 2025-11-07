import { Router } from "express";
import books from "./features/books/book_route.js";
import mail from "./features/mail/mail_route.js";
import admin from "./features/admin/admin_route.js";

const router = Router();

router.use("/", books);

router.use("/orders", mail);

router.use("/admin", admin);

export default router;