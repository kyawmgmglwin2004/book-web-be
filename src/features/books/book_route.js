import { Router } from "express"; // ⚠️ router npm package မဟုတ်ဘူး
import bookController from "./book_controller.js";
import multer from "multer";
import auth from "../../middlewear/authJwt.js"

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

const bookRouter = Router();

bookRouter.get("/books", bookController.bookList);
bookRouter.post("/books", auth.verifyAdminToken, upload.array("images",5), bookController.addBooks);
bookRouter.delete("/books/:id", auth.verifyAdminToken, bookController.deleteBook);
bookRouter.post("/books/:id", auth.verifyAdminToken, upload.array("images",5), bookController.updateBook);

export default bookRouter;
