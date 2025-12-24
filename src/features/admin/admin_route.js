import { Router } from "express";
import adminController from "./admin_controller.js";
import authJwt from "../../middlewear/authJwt.js";

const adminRouter = Router();

// public
adminRouter.post("/login", adminController.adminLogin);
adminRouter.post("/register", adminController.userRegister);

// protected

// demo protected route - returns decoded admin info from token
adminRouter.get("/me", authJwt.verifyAdminToken, (req, res) => {
	return res.json({ code: 200, status: "OK", message: "admin info", data: req.admin });
});

// customer/profile - returns profile for any authenticated user (customer or admin)
adminRouter.get("/profile", authJwt.verifyAnyToken, (req, res) => {
  return res.json({ code: 200, status: "OK", message: "profile", data: req.user });
});

export default adminRouter;