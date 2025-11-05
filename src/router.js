import { Router } from "express";
import books from "./features/books/book_route.js"

const router = Router();

router.use("/", books);

export default router;