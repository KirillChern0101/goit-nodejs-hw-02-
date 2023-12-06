const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "kirillchernliko@gmail.com",
    pass: "Kir0101",
  },
});

const sendVerificationEmail = async (toEmail, verificationLink) => {
  try {
    const mailOptions = {
      from: "kirillchernliko@gmail.com",
      to: toEmail,
      subject: "Email Verification",
      html: `Click <a href="${verificationLink}">here</a> to verify your email.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
  }
};

module.exports = { sendVerificationEmail };
