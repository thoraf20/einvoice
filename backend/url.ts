import { Router } from 'express'
import {
  loginHandler,
  registerHandler,
  resetPasswordHandler,
  sendOTPHandler,
  verifyOTPHandler
} from './src/routes/auth'
import { createCustomerRequestHandler, getCustomersRequestHandler, updateCustomerDetailsRequestHandler } from './src/routes/customers'

const router = Router()

router.post('/register', registerHandler)
router.post('/login', loginHandler)
router.post('/send_otp', sendOTPHandler)
router.post('/verify_otp', verifyOTPHandler)
router.post('/reset_password', resetPasswordHandler)

router.route('/customer')
  .post(createCustomerRequestHandler)
  .get(getCustomersRequestHandler)

router.route('/customer_update').patch(updateCustomerDetailsRequestHandler)
export default router