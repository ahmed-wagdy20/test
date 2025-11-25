import { sendEmail } from "../email/sendEmail.js";

import EventEmitter from "node:events";
export const event = new EventEmitter();

event.on("sendEmail", async ({
    to,
    subject,
    text,
    html,
    cc,
    bcc,
    attachments
}) => {
    await sendEmail({
        to,
        subject,
        text,
        html,
        cc,
        bcc,
        attachments
    })
})
