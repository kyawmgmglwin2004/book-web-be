import { Router } from "express";
import adminController from "./admin_controller.js";
import authJwt from "../../middlewear/authJwt.js";

const adminRouter = Router();

// public
adminRouter.post("/login", adminController.adminLogin);

// demo protected route - returns decoded admin info from token
adminRouter.get("/me", authJwt.verifyAdminToken, (req, res) => {
	return res.json({ code: 200, status: "OK", message: "admin info", data: req.admin });
});

export default adminRouter;