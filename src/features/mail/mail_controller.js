import mailSevice  from "./mail_service.js";

async function sendOrder(req, res) {
    try {
        const orderData = req.body;
        const mailResult = await mailSevice.processOrder(orderData);
        
       return res.json(mailResult)
    } catch (error) {
         console.error("Order API error:", error);
    res.status(500).json({ message: "Server error" });
    }
}

export default sendOrder;