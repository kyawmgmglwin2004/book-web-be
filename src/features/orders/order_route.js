import { Router } from "express";
import orderController from "./order_controller.js";

const orderRouter = Router();

orderRouter.get("/orders",  orderController.orderList);
orderRouter.get("/orders/:id", orderController.orderDetail);
orderRouter.delete("/orders/:id", orderController.deleteOrder);
export default orderRouter;