import { Router } from "express"; // ⚠️ router npm package မဟုတ်ဘူး
import bookController from "./book_controller.js";
import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

const bookRouter = Router();

bookRouter.get("/books", bookController.bookList);
bookRouter.get("/books/:id", bookController.bookDetail);
bookRouter.post("/books", upload.single("image"), bookController.addBooks);
bookRouter.delete("/books/:id", bookController.deleteBook);

export default bookRouter;
