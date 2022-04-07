import { RequestHandler } from 'express'
import httpStatus from 'http-status-codes'
import Joi from 'joi'
import crypto from 'crypto'
import mongoose from 'mongoose'
import moment from 'moment'
import bcrypt from 'bcryptjs'
import authService from '../services/auth.service'
import UserModel from '../models/User'
import sendOTPViaEmail from '../helpers/emailTemplate'
import OTPModel from '../models/OTP'

const { issue } = authService

export const registerHandler: RequestHandler = async (req, res) => {
  const passwordPattern = new RegExp(
    '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[-+_!@#$%^&*.,?]).+$'
  )
  const phonePattern = new RegExp('^[0-9-+]{11,}$')


  const requestSchema = Joi.object({
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().regex(phonePattern).min(11).required(),
    password: Joi.string().regex(passwordPattern).min(8).required(),
  })

  const { error, value } = requestSchema.validate(req.body)

  if (error) {
    return res.status(httpStatus.BAD_REQUEST).json({ error: error.message })
  }

  const existingUser = await UserModel.findOne({
    email: value.email,
  })

  if (existingUser) {
    return res.status(httpStatus.CONFLICT).json({})
  }

  // const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(value.password, 10)

  const user = await UserModel.create({
    email: value.email,
    phoneNumber: value.phoneNumber,
    password: hashedPassword,
  })

  const token = crypto.randomInt(1000, 9999)

  await sendOTPViaEmail({
    recipient: value.email,
    message: `<p>Your Envoice Account Confirmation Otp is : ${token}. The otp expires in 10 minutes</p>`,
  })

  await OTPModel.updateOne(
    {
      identifier: value.email,
    },
    { token },
    { upsert: true }
  )

  res.status(httpStatus.CREATED).json({ msg: 'Please check your email for email Verification OTP' })
}

export const loginHandler: RequestHandler = async (req, res) => {
  const requestSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  })

  const { value, error } = requestSchema.validate(req.body)

  if (error) {
    return res.status(httpStatus.BAD_REQUEST).json({ error: error.message })
  }

  const userExist = await UserModel.findOne({ email: value.email })

  if (!userExist) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ error: 'Invalid Credentials' })
  }
  
  const isMatch = await bcrypt.compare(value.password, userExist.password)

  if (!isMatch) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ error: 'Invalid Credentials' })
  }

  if (userExist) {
    const payload = {
      email: userExist.email,
      phoneNumber: userExist.phoneNumber,
    }
    const token = await issue({
      sub: userExist._id,
      iat: Date.now(),
      email: value.email,
    })
    return res.status(httpStatus.OK).json({ payload, token })
  } else {
    return res.status(httpStatus.UNAUTHORIZED).json()
  } 
}

export const resetPasswordHandler: RequestHandler = async (req, res) => {

   const passwordPattern = new RegExp(
    '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[-+_!@#$%^&*.,?]).+$'
  )
  const requestSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().regex(passwordPattern).min(8).required(),
    token: Joi.string().min(4).max(4).required()
  })

  const { error, value } = requestSchema.validate(req.body)

  if (error) {
    return res.status(httpStatus.BAD_REQUEST).json({ error: error.message })
  }

  const userExist = await UserModel.findOne({ email: value.email })

  if (!userExist) {
    return res.status(httpStatus.BAD_REQUEST).json({error: "User Not Found"})
  }

  const hashedPassword = await bcrypt.hash(value.password, 10)

  if (userExist) {
    await UserModel.updateOne(
      { email: value.email },
      { password: hashedPassword }
    )
    return res.status(httpStatus.OK).json({msg: 'Passwowd Updated Successfully'})
  } else {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json()
  }
}

export const sendOTPHandler: RequestHandler = async (req, res) => {

  const requestSchema = Joi.object({
    email: Joi.string().email().required(),
  })

  const { error, value } = requestSchema.validate(req.body)
  if (error) {
    return res.status(httpStatus.BAD_REQUEST).json({ error: error.message })
  }

  const token = crypto.randomInt(1000, 9999)

  await OTPModel.updateOne(
    {
      identifier: value.email,
    },
    { token },
    { upsert: true }
  )

  await sendOTPViaEmail({ message: `${token}`, recipient: value.email })

  return res.status(httpStatus.OK).json()
}

export const verifyOTPHandler: RequestHandler = async (req, res) => {
  const requestSchema = Joi.object({
    email: Joi.string().email().required(),
    token: Joi.string().required(),
  })

  const { error, value } = requestSchema.validate(req.body)
  if (error) {
    return res.status(httpStatus.BAD_REQUEST).json({ error: error.message })
  }

  const otp = await OTPModel.findOne({
    identifier: value.email,
    token: value.token,
  })

  if (!otp) {
    return res.status(httpStatus.UNAUTHORIZED).json()
  }

  const timeDiffInMin = moment().diff(otp._id.getTimestamp(), 'minutes')

  if (timeDiffInMin > 10) {
    await otp.deleteOne()
    return res.status(httpStatus.UNAUTHORIZED).json()
  }

  const session = await mongoose.startSession()
  await session.withTransaction(async () => {
      await UserModel.updateOne(
        { email: value.email },
        { isEmailVerified: true }
      )

    await otp.deleteOne()
  })
  await session.endSession()

  return res.status(httpStatus.OK).json()
}
