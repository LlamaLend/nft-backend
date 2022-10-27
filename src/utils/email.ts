const nodemailer = require("nodemailer");

export function sendEmail(emailTo: string, subject: string, body: string) {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.eu.mailgun.org", port: 587, auth: {
            user: "postmaster@mail.llamalend.com", pass: process.env.API_KEY_MAILGUN,
        },
    });

    // send mail with defined transport object 
    return transporter.sendMail({
        from: 'sbf@llamalend.com', to: emailTo, subject: subject, text: body
    });
}