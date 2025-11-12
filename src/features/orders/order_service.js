import Mysql from "../../helper/db.js";
import StatusCode from "../../helper/statusCode.js";

async function orderList(name, page = 1, limit = 10) {
  let connection;
  try {
    let sql = `SELECT * FROM orders WHERE 1=1`;
    const params = [];

    // Filter by customer name if provided
    if (name) {
      sql += ` AND name LIKE ?`;
      params.push(`%${name}%`);
    }

    // Calculate pagination offset
    const offset = (page - 1) * limit;
    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    connection = await Mysql.getConnection();
    console.log("sql:", sql, params);

    // Get paginated orders
    const [orderList] = await connection.query(sql, params);

    // Get total count for pagination info
    const countSql = `SELECT COUNT(*) as total FROM orders WHERE 1=1` +
      (name ? ` AND customer_name LIKE ?` : "");

    const countParams = name ? [`%${name}%`] : [];
    const [countResult] = await connection.query(countSql, countParams);

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    if (orderList.length === 0) {
      return StatusCode.NOT_FOUND("Orders not found!");
    }

    return StatusCode.OK({
      data: orderList,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching order list:", error);
    return StatusCode.UNKNOWN("Database error");
  } finally {
    if (connection) connection.release();
  }
}



async function orderDetail(id) {
    let connection;
    try {
        if(!id){
            return StatusCode.INVALID_ARGUMENT("need id for order detail");
        }
        let sql = `SELECT * FROM orders WHERE id = ? `;
        connection = await Mysql.getConnection();
        const [orders] = await connection.query(sql, [id]);
            for(const order of orders) {
                const [items] = await connection.query( `SELECT * FROM order_items WHERE order_id = ?`, [order.id]);
                order.items = items
            }
        if(orders.length === 0){
            return StatusCode.NOT_FOUND("order not found")
        }
            return StatusCode.OK(orders[0]);
    } catch (error) {
        console.log("Error get order detail");
        return StatusCode.UNKNOWN("server error")
    } finally {
    if (connection) connection.release();
  }
}

async function deleteOrder(id) {
    let connection;
    try {
        if(!id){
            return StatusCode.INVALID_ARGUMENT("need id for order detail");
        }
        connection = await Mysql.getConnection();
        let sql = `DELETE FROM orders WHERE id = ?`;
        const [result] = await connection.query(sql, [id]);

        if(result.affectedRows === 0) {
            return StatusCode.NOT_FOUND("order not found");
        }
            return StatusCode.OK("order delete successfully");
    } catch (error) {
        console.log("Error delete order list");
        return StatusCode.UNKNOWN("server error")
    } finally {
    if (connection) connection.release();
  }
}

export default{
    orderList,
    orderDetail,
    deleteOrder
}