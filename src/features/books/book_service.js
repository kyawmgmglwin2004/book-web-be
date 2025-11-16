import Mysql from "../../helper/db.js";
import StatusCode from "../../helper/statusCode.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// async function bookList(id, title, page = 1, limit = 2) {
//   let connection;
//   try {
//     let sql = `SELECT * FROM books WHERE 1=1`;
//     const params = [];

//     if (id) {
//       sql += ` AND id = ?`;
//       params.push(id);
//     }

//     if (title) {
//       sql += ` AND title LIKE ?`;
//       params.push(`%${title}%`);
//     }

//     // Calculate pagination offset
//     const offset = (page - 1) * limit;
//     sql += ` LIMIT ? OFFSET ?`;
//     params.push(parseInt(limit), parseInt(offset));

//     connection = await Mysql.getConnection();
//     console.log("sql :", sql, params);

//     // Get paginated books
//     const [bookList] = await connection.query(sql, params);

//     // Get total count for pagination info
//     const [countResult] = await connection.query(
//       `SELECT COUNT(*) as total FROM books WHERE 1=1
//        ${id ? " AND id = ?" : ""}
//        ${title ? " AND title LIKE ?" : ""}`,
//       id && title
//         ? [id, `%${title}%`]
//         : id
//         ? [id]
//         : title
//         ? [`%${title}%`]
//         : []
//     );

//     const total = countResult[0].total;
//     const totalPages = Math.ceil(total / limit);

//     if (bookList.length === 0) {
//       return StatusCode.NOT_FOUND("Book not found!");
//     }

//     return StatusCode.OK({
//       data: bookList,
//       pagination: {
//         total,
//         page,
//         limit,
//         totalPages,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching book list:", error);
//     return StatusCode.UNKNOWN("Database error");
//   } finally {
//     if (connection) connection.release();
//   }
// }

async function bookList(id, title, age, type,  page = 1, limit = 2) {
  let connection;

  try {
    connection = await Mysql.getConnection();

    let whereSql = `WHERE 1=1`;
    const params = [];

    if (id) {
      whereSql += ` AND b.id = ?`;
      params.push(id);
    }

    if (title) {
      whereSql += ` AND b.title LIKE ?`;
      params.push(`%${title}%`);
    }
    
    if (age) {
      whereSql += ` AND b.age = ?`;
      params.push(age);
    }

    if (type) {
      whereSql += ` AND b.type = ?`;
      params.push(type);
    }
  
    // Pagination offset
    const offset = (page - 1) * limit;

    // 🔥 SQL for books JOIN images
    const bookSql = `
      SELECT 
        b.id, b.title, b.price, b.stock, b.remark, b.age, b.type,
        bi.image_url
      FROM books b
      LEFT JOIN book_images bi ON b.id = bi.book_id
      ${whereSql}
      LIMIT ? OFFSET ?
    `;

    const bookParams = [...params, parseInt(limit), parseInt(offset)];

    console.log("SQL:", bookSql, bookParams);

    const [rows] = await connection.query(bookSql, bookParams);

    if (rows.length === 0) {
      return StatusCode.NOT_FOUND("Book not found!");
    }

    // 🔥 Group images under each book
    const books = {};
    rows.forEach((row) => {
      if (!books[row.id]) {
        books[row.id] = {
          id: row.id,
          title: row.title,
          price: row.price,
          stock: row.stock,
          type: row.type,
          age: row.age,
          remark: row.remark,
          images: []
        };
      }
      console.log("image :", row.image_url)
      if (row.image_url) {
        books[row.id].images.push(row.image_url);
      }
    });

    // Convert grouped object to array
    const resultBooks = Object.values(books);

    // ---------- GET TOTAL COUNT ----------
    let countSql = `
      SELECT COUNT(DISTINCT b.id) as total
      FROM books b
      LEFT JOIN book_images bi ON b.id = bi.book_id
      ${whereSql}
    `;

    const [countResult] = await connection.query(countSql, params);
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    return StatusCode.OK({
      data: resultBooks,
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

async function addBooks(title, price, stock, remark, type, age, imagePaths) {
  let connection;
  try {
    connection = await Mysql.getConnection();
    await connection.beginTransaction();

    // 1️⃣ Insert book
    const [bookResult] = await connection.query(
      `INSERT INTO books (title, price, type, age, stock, remark) VALUES (?, ?, ?, ?, ?, ?)`,
      [title, price, type, age, stock, remark]
    );

    const bookId = bookResult.insertId;

    // 2️⃣ Insert multiple images
    for (const img of imagePaths) {
      await connection.query(
        `INSERT INTO book_images (book_id, image_url) VALUES (?, ?)`,
        [bookId, img]
      );
    }
    if(bookResult.affectedRows === 0) {
      await connection.rollback();
      return StatusCode.INVALID_ARGUMENT("Invalid argument")
    }
    await connection.commit();
     return StatusCode.OK("New book successfully")
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error adding book:", error);
    return StatusCode.UNKNOWN("Server error")
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

async function updateBook(id, title, imagePaths, price, stock, type, age, remark) {
  let connection;

  try {
    connection = await Mysql.getConnection();
    await connection.beginTransaction();

    // 1️⃣ Check if book exists
    const [bookRows] = await connection.query(
      "SELECT id FROM books WHERE id = ?",
      [id]
    );

    if (bookRows.length === 0) {
      return StatusCode.NOT_FOUND("Book not found!");
    }

    // 2️⃣ Get old image list
    const [oldImages] = await connection.query(
      "SELECT image_url FROM book_images WHERE book_id = ?",
      [id]
    );

    // Prepare fields for update
    const fields = [];
    const values = [];

    if (title !== undefined) {
      fields.push("title = ?");
      values.push(title);
    }
    if (price !== undefined) {
      fields.push("price = ?");
      values.push(price);
    }
    if (stock !== undefined) {
      fields.push("stock = ?");
      values.push(stock);
    }
    if (type !== undefined) {
      fields.push("type = ?");
      values.push(type);
    }
    if (age !== undefined) {
      fields.push("age = ?");
      values.push(age);
    }
    if (remark !== undefined) {
      fields.push("remark = ?");
      values.push(remark);
    }

    // 3️⃣ Update book fields
    if (fields.length > 0) {
      const sql = `UPDATE books SET ${fields.join(", ")} WHERE id = ?`;
      values.push(id);
      await connection.query(sql, values);
    }

    // 4️⃣ Update images if new ones are provided
    if (imagePaths && imagePaths.length > 0) {
      // -- DELETE old DB records
      await connection.query("DELETE FROM book_images WHERE book_id = ?", [id]);

      // -- DELETE old image files
      for (const img of oldImages) {
        const imgUrl = img.image_url;
        const idx = imgUrl.indexOf("/uploads/");
        if (idx !== -1) {
          const relative = imgUrl.substring(idx + 1);
          const fullPath = path.join(process.cwd(), relative);

          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log("Deleted old:", fullPath);
          }
        }
      }

      // -- INSERT new images
      for (const newImg of imagePaths) {
        await connection.query(
          "INSERT INTO book_images (book_id, image_url) VALUES (?, ?)",
          [id, newImg]
        );
      }
    }

    await connection.commit();
    return StatusCode.OK("Book updated successfully!");
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error updating book:", error);
    return StatusCode.UNKNOWN("Internal server error");
  } finally {
    if (connection) connection.release();
  }
}




export default {
  bookList,
  addBooks,
  deleteBook,
  updateBook
};
