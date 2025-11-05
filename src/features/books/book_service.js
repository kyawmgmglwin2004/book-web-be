import Mysql from "../../helper/db.js";
import StatusCode from "../../helper/statusCode.js";

async function bookList(id, title) {
    let connection;
    try {
        let sql = `SELECT * FROM books WHERE 1=1`;
        const params = [];

         if(id) {
            sql += ` AND id = ?`;
            params.push(id);
        }

        if(title) {
            sql += ` AND title LIKE ?`;
            params.push(`%${title}%`);
        }
       
        connection = await Mysql.getConnection();
        console.log("sql :", sql)
        const [bookList] = await connection.query(sql, params);
        if(bookList.length === 0){
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

        if(detail.length === 0) {
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
export default {
    bookList,
    bookDetail
}