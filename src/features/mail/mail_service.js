import nodemailer from "nodemailer";
import Mysql from "../../helper/db.js";
import { config } from "../../configs/config.js";
import StatusCode from "../../helper/statusCode.js";

// ✅ Send Email Function
async function sendOrderMail(orderData) {
  try {
    if (!orderData) {
      return StatusCode.INVALID_ARGUMENT("Invalid argument");
    }

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

    if (!info) {
      return StatusCode.UNKNOWN("Email sending error");
    }

    return StatusCode.OK("Email sent successfully");
  } catch (error) {
    console.error("Email error:", error);
    return StatusCode.UNKNOWN("Email sending error");
  }
}

// ✅ Main Process — Insert first, mail next
async function processOrder(orderData) {
  let connection;
  try {
    const { name, email, phone, address } = orderData.customer;
    const total = orderData.total;

    if (!name || !email || !phone || !address || !total) {
      return StatusCode.INVALID_ARGUMENT("Invalid argument for order");
    }

    connection = await Mysql.getConnection();
    await connection.beginTransaction();

    // 1️⃣ Insert order
    const [orderResult] = await connection.query(
      `INSERT INTO orders (name, email, phone, address, total)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone, address, total]
    );

    const orderId = orderResult.insertId;

    // 2️⃣ Insert order items and update stock
    for (const item of orderData.items) {
      await connection.query(
        `INSERT INTO order_items (order_id, name, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.title, item.qty, item.price]
      );

      const [rows] = await connection.query(
        `SELECT stock FROM books WHERE id = ?`,
        [item.id]
      );

      if (!rows.length) {
        await connection.rollback();
        return StatusCode.NOT_FOUND("Book not found");
      }

      if (rows[0].stock < item.qty) {
        await connection.rollback();
        return StatusCode.RESOURCE_EXHAUSTED("Not enough stock to order");
      }

      const [updateResult] = await connection.query(
        `UPDATE books SET stock = stock - ? WHERE id = ?`,
        [item.qty, item.id]
      );

      if (updateResult.affectedRows === 0) {
        await connection.rollback();
        return StatusCode.UNKNOWN("Stock update failed");
      }
    }

    // 3️⃣ Send email AFTER successful DB operations
    const mailStatus = await sendOrderMail(orderData);

    if (mailStatus.code !== 200) {
      // ❌ Email failed → rollback
      await connection.rollback();
      console.error("❌ Email sending failed. Transaction rolled back.");
      return StatusCode.UNKNOWN("Mail sending failed, order not saved");
    }

    // ✅ Email success → commit transaction
    await connection.commit();
    console.log("✅ Order committed successfully with mail");
    return StatusCode.OK({ orderId, message: "Order saved & mail sent" });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("❌ DB Error:", error);
    return StatusCode.UNKNOWN("Error processing order");
  } finally {
    if (connection) connection.release();
  }
}

export default {
  processOrder,
};
