import { Router } from "express";
import adminController from "./admin_controller.js";

const adminRouter = Router();

adminRouter.post("/login", adminController.adminLogin);

export default adminRouter;