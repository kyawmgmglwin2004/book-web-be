import Mysql from "../../helper/db.js";
import StatusCode from "../../helper/statusCode.js";
import bcrypt from "bcrypt";

async function adminLogin(userName, email, password) {
  let connection;
  try {
    let sql = `SELECT * FROM users WHERE userName = ? AND email = ?`;
    connection = await Mysql.getConnection();
    const [admin] = await connection.query(sql, [userName, email]);

    if (admin.length === 0) {
      return StatusCode.NOT_FOUND("admin not found!");
    }
    const isMatch = await bcrypt.compare(password, admin[0].password);
    if (!isMatch) {
      return StatusCode.INVALID_ARGUMENT("Password is not correct!");
    }
        return StatusCode.OK("admin login success", admin[0])
  } catch (error) {
    console.error("Error fetching admin list:", error);
    return StatusCode.UNKNOWN("Database error");
  } finally {
    if (connection) connection.release();
  }
}
export default {
    adminLogin
}
