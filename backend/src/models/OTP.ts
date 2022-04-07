import { model, Schema } from 'mongoose'

type OTP = {
  identifier: string
  token: string
}

const schema = new Schema<OTP>(
  {
    identifier: { type: String, unique: true, required: true },
    token: { type: String, required: true },
  },
  { collection: 'otps', timestamps: true }
)

const OTPModel = model<OTP>('OTP', schema)

export default OTPModel
