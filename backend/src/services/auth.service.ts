import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export interface UserTokenType {
  sub: string
  iat: number
  email?: string
}
export default class authService {
  public static issue(payload: UserTokenType): Promise<string> {
    return new Promise((resolve, reject) =>
      jwt.sign(
        payload,
        `${process.env.JWT_SECRET}`,
        { expiresIn: `${process.env.JWT_LIFETIME}` },
        (error, decoded) => {
          if (error) return reject(error)
          // match decoded parameter argument conflict
          return resolve(decoded as string | Promise<string>)
        }
      )
    )
  }

  public static verify(token: string): Promise<any> {
    return new Promise((resolve, reject) =>
      jwt.verify(
        token,
        `${process.env.JWT_SECRET}`,
        (error: any, decoded: any) => {
          if (error) return reject(error)
          return resolve(decoded)
        }
      )
    )
  }
}
