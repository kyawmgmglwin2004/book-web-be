import bookService from "./book_service.js";
// import StatusCode from "../../helper/statusCode.js";
import { config } from "../../configs/config.js";
const domain = config.DOMAIN;

async function bookList(req, res) {
    try {
        const { id, title } = req.query;
        console.log("params :", title)
        const books = await bookService.bookList(id , title);

        return res.json(books)

    } catch (error) {
        console.error("Error get book list action:", error);

        return res
            .status(500)
            .json("SERVER ERROR");
    }
}

async function bookDetail(req, res) {
    try {
        const id = req.query.id;
        const detail = await bookService.bookDetail(id);
        return res.json(detail);
    } catch (error) {
        console.error("Error get book list action:", error);

        return res
            .status(500)
            .json("SERVER ERROR");
    }
}

async function addBooks(req, res) {
    try {
        const { title, price, stock, remark } = req.body;
        const imagePath = req.file ? `${domain}/uploads/${req.file.filename}` : null;
        const result = await bookService.addBooks(title, imagePath, price, stock, remark);
        return res.json(result);
    } catch (error) {
        console.error("Error get book list action:", error);

        return res
            .status(500)
            .json("SERVER ERROR");
    }
}

async function deleteBook(req, res) {
    try {
        const {id} = req.params;
        const result = await bookService.deleteBook(id);
        return res.json(result);
    } catch (error) {
         console.error("Error get book list action:", error);

        return res
            .status(500)
            .json("SERVER ERROR");
    }
}
 export default {
    bookList,
    bookDetail,
    addBooks,
    deleteBook
 }