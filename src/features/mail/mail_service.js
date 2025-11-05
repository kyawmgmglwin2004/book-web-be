import nodemailer from "nodemailer";

export const sendOrderMail = async (orderData) => {
    try {
        const transposter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "kyawmgmglwin146018@gmail.com",
                pass: "ftjx bgcm nfan crds",
            },
        });

        const mailOptions = {
            from: '"Bookworm Babies" <kyawmgmglwin146018@gmail.com>',
            to: orderData.formData.email,
            subject: "📦 Your Bookworm Babies Order Confirmation",
      html: `
        <h2>Thanks for your order, ${orderData.formData.name}!</h2>
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
        <p>Delivery Address: ${orderData.formData.address}</p>
        <p>Payment Method: ${orderData.formData.payment}</p>
        <p>Thank you for shopping with us 💖</p>
      `,
    };

    // ✅ send email
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    return true;
        
    } catch (error) {
        console.error("❌ Error sending email:", error);
        return false;
    }
}