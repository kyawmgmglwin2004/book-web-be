import adminService from "./admin_service.js";

async function adminLogin(req, res ) {
    try {
        const { userName , email, password } = req.body;
        const admin = await adminService.adminLogin(userName, email, password);

        return res.json(admin);

    } catch (error) {
         console.error("Error get book list action:", error);

        return res
            .status(500)
            .json("SERVER ERROR");
    }
}

export default {
    adminLogin
}