import adminService from "./admin_service.js";
import authJwt from "../../middlewear/authJwt.js";

async function adminLogin(req, res ) {
    try {
        const { userName , email, password } = req.body;
        const serviceRes = await adminService.adminLogin(userName, email, password);

        // serviceRes is a StatusCode object
        if (serviceRes && serviceRes.code === 200) {
            const admin = serviceRes.data;
            // generate token
            const token = authJwt.signAdminToken(admin);
            // return same shape but include token in data
            console.log("token :", admin)
            return res.json({ code: 200, status: "OK", message: "admin login success", data: { admin, token } });
        }

        // pass through service response (errors)
        return res.json(serviceRes);

    } catch (error) {
         console.error("Error admin login action:", error);

        return res
            .status(500)
            .json("SERVER ERROR");
    }
}

export default {
    adminLogin
}