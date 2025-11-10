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
        let sql = `SELECT * FORM orders WHERE id = ? `;
        connection = await Mysql.getConnection();
        const [order] = await connection.query(sql, [id]);
        if(order.length === 0){
            return StatusCode.NOT_FOUND("order not found")
        }
            return StatusCode.OK(order[0]);
    } catch (error) {
        console.log("Error get order list");
        return StatusCode.UNKNOWN("server error")
    }
}

export default{
    orderList,
    orderDetail
}