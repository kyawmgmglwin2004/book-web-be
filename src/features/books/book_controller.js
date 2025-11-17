import bookService from "./book_service.js";
// import StatusCode from "../../helper/statusCode.js";
import { config } from "../../configs/config.js";
const domain = config.DOMAIN;

async function bookList(req, res) {
    try {
        const { id, title, age, type, page, limit } = req.query;
        console.log("params :", title)
        const books = await bookService.bookList(id , title, age, type, page, limit);

        return res.json(books)

    } catch (error) {
        console.error("Error get book list action:", error);

        return res
            .status(500)
            .json("SERVER ERROR");
    }
}

async function addBooks(req, res) {
    try {
        const { title, price, stock, remark, type, age } = req.body;

        // multiple images
        const imagePaths = req.files?.map(file => `${domain}/uploads/${file.filename}`) || [];

        const result = await bookService.addBooks(title, price, stock, remark, type, age, imagePaths);
        return res.json(result);
    } catch (error) {
        console.error("Error add new book action:", error);
        return res.status(500).json("SERVER ERROR");
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

// async function updateBook(req, res) {
//   try {
//     const { id } = req.params;
//     const { title, price, stock, type, age, remark } = req.body;

//     // ✅ imagePath ကို undefined ထားမယ် (အသစ်တင်မှသာ assign)
//     let imagePaths;
//     if (req.files) {
//       imagePaths = req.files.map(file => `${domain}/uploads/${file.filename}`) || [];
//     }

//     const result = await bookService.updateBook(
//       id,
//       title,
//       imagePaths,
//       price,
//       stock,
//       type,
//       age,
//       remark
//     );

//     return res.json(result);
//   } catch (error) {
//     console.error("Error update book action:", error);
//     return res.status(500).json("SERVER ERROR");
//   }
// }
async function updateBook(req, res) {
  try {
    const { id } = req.params;
    const { title, price, stock, type, age, remark } = req.body;

    // ====== 1) OLD IMAGES ======
    let oldImages = req.body.oldImage || [];
console.log("REQ BODY:", req.body.oldImage);
    console.log("REQ FILES:", req.files);
   
    if (typeof oldImages === "string") {
      oldImages = [oldImages];
    }

    let newImages = [];
    if (req.files && req.files.length > 0) {
      newImages = req.files.map((file) => `${domain}/uploads/${file.filename}`);
    }

    const finalImagePaths = [...oldImages, ...newImages];

    const result = await bookService.updateBook(
      id,
      title,
      finalImagePaths,
      price,
      stock,
      type,
      age,
      remark
    );

    return res.json(result);

  } catch (error) {
    console.error("Error update book action:", error);
    return res.status(500).json("SERVER ERROR");
  }
}


 export default {
    bookList,
    addBooks,
    deleteBook,
    updateBook
 }