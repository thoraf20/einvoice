import express, { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import httpStatus from 'http-status-codes'
import logger from './src/lib/logger'
import { requestLogger } from './src/middleware/requestLogger'

import dotenv from 'dotenv'

dotenv.config()

const unless = (path: string[], middleware: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (path.includes(req.path)) {
      return next()
    } else {
      return middleware(req, res, next)
    }
  }
}

const app = express()
const port = process.env.PORT || 8000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(requestLogger)

// app.use(unless(['/v1/register'], checkJwt))
app.use((req: Request, res: Response, next: NextFunction) => {
  const authorization = req.header('Authorization')
  const accessToken = authorization?.split(' ')[1] as string
  const decoded = jwt.decode(accessToken)

  res.locals.user = { _id: decoded?.sub }
  next()
})

// 404
app.use((req, res) => {
  res.status(httpStatus.NOT_FOUND).send()
})

// Security
if (process.env.NODE_ENV === 'production') {
  app.use(helmet())
}

mongoose.connect(`${process.env.MONGO_URI}`, {})
mongoose.connection.on('error', (error) => {
  logger.error('Database connection error: ', error)
})

app.listen(port, () => {
  logger.info(`Server is up and running at port: ${port}.`)
})

export default app
