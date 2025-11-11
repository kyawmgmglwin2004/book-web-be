import orderService from "../orders/order_service.js";

async function orderList(req, res) {
    try {
        const orders = await orderService.orderList();
        return res.json(orders);
    } catch (error) {
        console.error("Error get book list action:", error);

        return res
            .status(500)
            .json("SERVER ERROR");
    }
}

async function orderDetail(req, res) {
    try {
        const {id} = req.params;
        const order = await orderService.orderDetail(id);
        return res.json(order);
    } catch (error) {
        console.error("Error get book list action:", error);

        return res
            .status(500)
            .json("SERVER ERROR");
    }
}

async function deleteOrder(req, res) {
    try {
        const {id} = req.params;
        const result = await orderService.deleteOrder(id);
        return res.json(result);
    } catch (error) {
        console.error("Error delete book  action:", error);

        return res
            .status(500)
            .json("SERVER ERROR");
    }
}
export default {
    orderList,
    orderDetail,
    deleteOrder
}

