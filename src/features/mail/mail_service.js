import nodemailer from "nodemailer";
import Mysql from "../../helper/db.js";
import { config } from "../../configs/config.js";

async function sendOrderMail(orderData) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: config.GMAIL_USER,
        pass: config.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Bookworm Babies" <${config.GMAIL_USER}>`,
      to: orderData.customer.email,
      subject: "📦 Your Bookworm Babies Order Confirmation",
      html: `
        <h2>Thanks for your order, ${orderData.customer.name}!</h2>
        <p>We’ve received your order and will deliver soon.</p>
        <h3>Order Summary:</h3>
        <ul>
          ${orderData.items
            .map(
              (book) =>
                `<li>${book.title} (x${book.qty}) - $${book.price * book.qty}</li>`
            )
            .join("")}
        </ul>
        <p><b>Total:</b> $${orderData.total}</p>
        <hr>
        <p>Delivery Address: ${orderData.customer.address}</p>
        <p>Payment Method: ${orderData.customer.payment}</p>
        <p>Thank you for shopping with us 💖</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return false;
  }
}

async function orderInsert(orderData) {
  let connection;
  try {
    connection = await Mysql.getConnection();
    await connection.beginTransaction();

    const { name, email, phone, address } = orderData.customer;
    const total = orderData.total;

    const [orderResult] = await connection.query(
      `INSERT INTO orders (name, email, phone, address, total)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone, address, total]
    );

    const orderId = orderResult.insertId;

    for (const item of orderData.items) {
      await connection.query(
        `INSERT INTO order_items (order_id, name, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.title, item.qty, item.price]
      );
    }

    await connection.commit();
    return orderId;
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("❌ Error inserting order:", error.message);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

export async function processOrder(orderData) {
  try {
    // STEP 1: Try sending email first
    const mailSent = await sendOrderMail(orderData);

    if (!mailSent) {
      console.warn("⚠️ Email failed. Order not saved.");
      return { success: false, message: "Failed to send email. Order not saved." };
    }

    // STEP 2: Only if mail sent, save order in DB
    const orderId = await orderInsert(orderData);
    console.log("✅ Order saved with ID:", orderId);

    return {
      success: true,
      message: "Email sent and order saved successfully.",
      orderId,
    };
  } catch (error) {
    console.error("❌ Error processing order:", error);
    return { success: false, message: "Error processing order" };
  }
}

export default {
  sendOrderMail,
  orderInsert,
  processOrder,
};
