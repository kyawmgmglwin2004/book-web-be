import { Router } from "express";
import orderController from "./order_controller.js";

const orderRouter = Router();

orderRouter.get("/orders",  orderController.orderList);
orderRouter.get("/orders/:id", orderController.orderDetail);
export default orderRouter;