// import { createTestAccount, createTransport }, nodemailer from 'nodemailer'
import nodemailer from 'nodemailer'
import { nodeconfig } from '../config/nodemailer'
import dotenv from 'dotenv'
dotenv.config()

type Email = {
  to: string
  subject: string
  html: string
}

const sendEmail = async ({ to, subject, html }: Email) => {
  // let testAccount = await createTestAccount()

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_ADDRESS,
      pass: process.env.MAIL_PWD,
    },
  })

  return transporter.sendMail({
    from: '"Envoice" <thoraf20@gmail.com>',
    to,
    subject,
    html,
  })
}

export default sendEmail
