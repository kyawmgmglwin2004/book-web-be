import { Router } from "express"; // ⚠️ router npm package မဟုတ်ဘူး
import bookController from "./book_controller.js";

const bookRouter = Router();

bookRouter.get("/books", bookController.bookList);
bookRouter.get("/books/:id", bookController.bookDetail);

export default bookRouter;
