import mailSevice  from "./mail_service.js";

async function sendOrder(req, res) {
    try {
        const orderData = req.body;
        const mailResult = await mailSevice.processOrder(orderData);

        if (mailResult) {
            return res.status(200).json({
                code: 200,
                message: "Order received & email sent successfully!",
            });
        } else {
            return res.status(500).json({
                code: 500,
                message: "Order saved but email failed."
            });
        }
    } catch (error) {
         console.error("Order API error:", error);
    res.status(500).json({ message: "Server error" });
    }
}

export default sendOrder;