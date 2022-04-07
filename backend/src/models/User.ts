import { model, Schema } from 'mongoose'

type User = {
  _id: string
  email: string
  phoneNumber: string
  password: string
  isEmailVerified: boolean
}

const UserSchema = new Schema<User>(
  {
    email: { type: String },
    phoneNumber: { type: String },
    password: { type: String },
    isEmailVerified: { type: Boolean, default: false },
  },
  { collection: 'users', timestamps: true }
)

const UserModel = model<User>('Users', UserSchema)

export default UserModel
