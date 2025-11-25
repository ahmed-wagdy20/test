import nodemailer from "nodemailer";


export const sendEmail = async ({ to, subject, text = "", html, cc, bcc = "", attachments = [] }) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.APP_PASS,
        },
    });



    const info = await transporter.sendMail({
        from: `"Saraha_App" <${process.env.EMAIL}>`,
        to,
        subject,
        text,
        html,
        cc,
        bcc,
        attachments

    });

    console.log("Message sent:", info.messageId);

}