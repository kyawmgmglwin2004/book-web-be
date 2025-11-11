import Mysql from "../../helper/db.js";
import StatusCode from "../../helper/statusCode.js";

async function orderList() {
    let connection;
    try {
        const sql = `SELECT * FROM orders ORDER BY created_at DESC`;
        connection = await Mysql.getConnection();
        const [orders] = await connection.query(sql);

        if(orders.length===0) {
            return StatusCode.NOT_FOUND("order not found.")
        }
            return StatusCode.OK(orders);
    } catch (error) {
        console.log("Error get order list");
        return StatusCode.UNKNOWN("server error")
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
    }
}

export default{
    orderList,
    orderDetail,
    deleteOrder
}