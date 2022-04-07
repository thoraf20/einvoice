import sendEmail from './email'

type EmailDetails = {
  recipient: string,
  message: string,
}

const sendOTPViaEmail = async ({ message, recipient }: EmailDetails) => {
  // const message = `<p>Your Sherz Account Confirmation Otp is : ${verificationToken}. The otp expires in 10 minutes</p>`

  return sendEmail({
    to: recipient,
    subject: `Envoice Account Verification,`,
    html: `<h4> Hello,</h4>
    ${message} 
    `,
  })
}

export default sendOTPViaEmail
