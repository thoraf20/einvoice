import { Router } from 'express'
import { loginHandler, registerHandler, resetPasswordHandler, sendOTPHandler, verifyOTPHandler } from './src/routes/auth'

const router = Router()

router.post('/register', registerHandler)
router.post('/login', loginHandler)
router.post('/send_otp', sendOTPHandler)
router.post('/verify_otp', verifyOTPHandler)
router.post('/reset_password', resetPasswordHandler)


export default router