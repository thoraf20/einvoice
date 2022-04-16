import { RequestHandler } from 'express'
import httpStatus from 'http-status-codes'
import Joi from 'joi'
import CustomerModel from '../models/Customer'


export const createCustomerRequestHandler: RequestHandler = async (req, res) => {
  const phonePattern = new RegExp('^[0-9-+]{11,}$')

  const customerSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().regex(phonePattern).min(11).required(),
  }) 

  const { error, value } = customerSchema.validate(req.body)

  if (error) {
    return res.status(httpStatus.BAD_REQUEST).json({ error: error.message })
  }

  const existingUser = await CustomerModel.findOne({
    email: value.email,
    phoneNumber: value.phoneNumber
  })

  if (existingUser) {
    return res.status(httpStatus.CONFLICT).json({msg: "This customer exist in your record"})
  }

  const createdCustomer = await CustomerModel.create({
    email: value.email,
    phoneNumber: value.phoneNumber,
    user: res.locals.user._id,
  })

  if (createdCustomer) {
    return res.status(httpStatus.CREATED).json({ createdCustomer })
  } else {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json()
  }
}

export const getCustomersRequestHandler: RequestHandler = async (req, res) => {
  try {
    const customers = await CustomerModel.find({ user: res.locals.user._id })
    
    if (customers.length === 0) {
      return res.status(httpStatus.NOT_FOUND).json({msg: "You have not register customers yet"})
    }

    return res.status(httpStatus.OK).json({customers})
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json()
  }
}

export const updateCustomerDetailsRequestHandler: RequestHandler = async (req, res) => {

  try {
    const existingUser = await CustomerModel.findOne({
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
    })

    if (!existingUser) {
      return res
        .status(httpStatus.CONFLICT)
        .json({ msg: 'This customer does not exist in your record' })
    }
    await CustomerModel.updateOne({ email: req.body.email }, req.body)
    
    return res.status(httpStatus.OK).json({msg: "Customer details successfully updated"})
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json()
  }
}