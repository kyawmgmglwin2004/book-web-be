import { Router } from "express";
import orderController from "./order_controller.js";
import auth from "../../middlewear/authJwt.js"

const orderRouter = Router();

orderRouter.get("/orders", auth.verifyAdminToken,  orderController.orderList);
orderRouter.get("/orders/:id",auth.verifyAdminToken, orderController.orderDetail);
orderRouter.delete("/orders/:id",auth.verifyAdminToken, orderController.deleteOrder);
orderRouter.post("/orders/:id",auth.verifyAdminToken, orderController.updateOrder);
export default orderRouter;