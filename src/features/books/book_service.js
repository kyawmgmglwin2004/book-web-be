import Mysql from "../../helper/db.js";
import StatusCode from "../../helper/statusCode.js";
import multer from "multer";
import path from "path";
import fs from "fs";

async function bookList(id, title) {
  let connection;
  try {
    let sql = `SELECT * FROM books WHERE 1=1`;
    const params = [];

    if (id) {
      sql += ` AND id = ?`;
      params.push(id);
    }

    if (title) {
      sql += ` AND title LIKE ?`;
      params.push(`%${title}%`);
    }

    connection = await Mysql.getConnection();
    console.log("sql :", sql);
    const [bookList] = await connection.query(sql, params);
    if (bookList.length === 0) {
      return StatusCode.NOT_FOUND("Book not found!");
    }
    return StatusCode.OK(bookList);
  } catch (error) {
    console.error("Error fetching book list:", error);
    return StatusCode.UNKNOWN("Database error");
  } finally {
    if (connection) connection.release();
  }
}

async function bookDetail(id) {
  let connection;
  try {
    let sql2 = `SELECT * FROM books WHERE id = 1 `;
    connection = await Mysql.getConnection();
    const [detail] = await connection.query(sql2, id);

    if (detail.length === 0) {
      return StatusCode.NOT_FOUND("Book not found with this id");
    }

    return StatusCode.OK(detail[0]);
  } catch (error) {
    console.error("Error fetching book:", error);
    return StatusCode.UNKNOWN("Database error");
  } finally {
    if (connection) connection.release();
  }
}

async function addBooks(title, imagePath, price, stock, remark) {
  let connection;
  try {
    let sql = `INSERT INTO books (title, image, price, stock, remark) VALUES (?, ?, ?, ?, ?)`;
    connection = await Mysql.getConnection();
    const book = await connection.query(sql, [
      title,
      imagePath,
      price,
      stock,
      remark,
    ]);
    return StatusCode.OK("Book added Successfully!");
  } catch (error) {
    console.error("Error adding book:", error);
    return StatusCode.UNKNOWN("Database error");
  } finally {
    if (connection) connection.release();
  }
}

async function deleteBook(id) {
  let connection;
  try {
    connection = await Mysql.getConnection();
    const [book] = await connection.query(
      "SELECT image FROM books WHERE id = ?",
      [id]
    );
    if (book.length === 0) return StatusCode.NOT_FOUND("Book not found!");

    const imagePath = book[0].image;
    if (imagePath) {
      // extract the file path part after /uploads/
      const uploadIndex = imagePath.indexOf("/uploads/");
      let relativePath = "";

      if (uploadIndex !== -1) {
        relativePath = imagePath.substring(uploadIndex + 1); // remove leading '/'
      }

      const fullPath = path.join(process.cwd(), relativePath);
      console.log("Deleting:", fullPath);

      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log("File deleted successfully!");
      } else {
        console.log("File not found:", fullPath);
      }
    }
    const [result] = await connection.query("DELETE FROM books WHERE id = ?", [
      id,
    ]);
    if (result.affectedRows === 0)
      return StatusCode.NOT_FOUND("Book not found!");

    return StatusCode.OK("Book deleted successfully!");
  } catch (error) {
    console.error("Error deleting book:", error);
    return StatusCode.UNKNOWN("Database error");
  } finally {
    if (connection) connection.release();
  }
}

async function updateBook(id, title, imagePath, price, stock, remark ) {
    let connection;
    try {
         connection = await Mysql.getConnection();
    const [book] = await connection.query(
      "SELECT image FROM books WHERE id = ?",
      [id]
    );
    if (book.length === 0) return StatusCode.NOT_FOUND("Book not found!");

    const imagePath = book[0].image;
    if (imagePath) {
      // extract the file path part after /uploads/
      const uploadIndex = imagePath.indexOf("/uploads/");
      let relativePath = "";

      if (uploadIndex !== -1) {
        relativePath = imagePath.substring(uploadIndex + 1); // remove leading '/'
      }

      const fullPath = path.join(process.cwd(), relativePath);
      console.log("Deleting:", fullPath);

      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log("File deleted successfully!");
      } else {
        console.log("File not found:", fullPath);
      }
    }

    const fields = [];
    const values = [];

    if(title !== undefined) {
        fields.push("title = ?");
        values.push(userId);
    }

    if(imagePath !== undefined) {
        fields.push("imagePath = ?");
        values.push(imagePath);
    }

    if(price !== undefined) {
        
    }
    } catch (error) {
        
    }
}

export default {
  bookList,
  bookDetail,
  addBooks,
  deleteBook,
};
