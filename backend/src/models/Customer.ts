import { model, Schema } from 'mongoose'

type Customer = {
  name: string
  email: string
  phoneNumber: string
  user: string
}

const CustomerSchema = new Schema<Customer>(
  {
    name: { type: String },
    email: { type: String },
    phoneNumber: { type: String },
    user: {type: String}
  },
  { collection: 'customers', timestamps: true }
)

const CustomerModel = model<Customer>('Customers', CustomerSchema)

export default CustomerModel
