import Mysql from "../../helper/db.js";
import StatusCode from "../../helper/statusCode.js";
import multer from "multer";
import path from "path";
import fs from "fs";

async function bookList(id, title, page = 1, limit = 2) {
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

    // Calculate pagination offset
    const offset = (page - 1) * limit;
    sql += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    connection = await Mysql.getConnection();
    console.log("sql :", sql, params);

    // Get paginated books
    const [bookList] = await connection.query(sql, params);

    // Get total count for pagination info
    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM books WHERE 1=1
       ${id ? " AND id = ?" : ""}
       ${title ? " AND title LIKE ?" : ""}`,
      id && title
        ? [id, `%${title}%`]
        : id
        ? [id]
        : title
        ? [`%${title}%`]
        : []
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    if (bookList.length === 0) {
      return StatusCode.NOT_FOUND("Book not found!");
    }

    return StatusCode.OK({
      data: bookList,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
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

async function updateBook(id, title, imagePath, price, stock, remark) {
  let connection;
  try {
    connection = await Mysql.getConnection();

    // 1️⃣ Get existing book record
    const [bookRows] = await connection.query(
      "SELECT image FROM books WHERE id = ?",
      [id]
    );
    if (bookRows.length === 0) {
      return StatusCode.NOT_FOUND("Book not found!");
    }

    const oldImagePath = bookRows[0].image;
    const fields = [];
    const values = [];

    if (title !== undefined) {
      fields.push("title = ?");
      values.push(title);
    }

    // ✅ အသစ် image တင်ထားမှသာ update
    if (imagePath !== undefined) {
      // ဖျက်ဖို့ old image path သုံး
      const uploadIndex = oldImagePath.indexOf("/uploads/");
      let relativePath = "";

      if (uploadIndex !== -1) {
        relativePath = oldImagePath.substring(uploadIndex + 1); // remove leading '/'
      }

      const fullPath = path.join(process.cwd(), relativePath);
      console.log("Deleting:", fullPath);

      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log("Old file deleted successfully!");
      } else {
        console.log("Old file not found:", fullPath);
      }

      fields.push("image = ?");
      values.push(imagePath);
    }

    if (price !== undefined) {
      fields.push("price = ?");
      values.push(price);
    }

    if (stock !== undefined) {
      fields.push("stock = ?");
      values.push(stock);
    }

    if (remark !== undefined) {
      fields.push("remark = ?");
      values.push(remark);
    }

    // 4️⃣ Update only if there are fields to update
    if (fields.length > 0) {
      const sql = `UPDATE books SET ${fields.join(", ")} WHERE id = ?`;
      values.push(id);

      await connection.query(sql, values);
    }

    return StatusCode.OK("Book updated successfully!");
  } catch (error) {
    console.error("Error updating book:", error);
    return StatusCode.UNKNOWN("Internal server error");
  } finally {
    if (connection) connection.release();
  }
}



export default {
  bookList,
  bookDetail,
  addBooks,
  deleteBook,
  updateBook
};
