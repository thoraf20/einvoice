import dotenv from 'dotenv'
dotenv.config()

export const nodeconfig = {
  service: 'gmail',
  port: process.env.MAIL_PORT,
  secure: true,
  auth: {
    user: process.env.MAIL_ADDRESS,
    pass: process.env.MAIL_PWD,
  },
  tls: {
    rejectUnAuthorized: true,
  },
}
