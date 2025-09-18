import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { db } from '../lib/db'
import { RegisterInput, LoginInput, JWTPayload } from '../types'

const JWT_SECRET = process.env.JWT_SECRET!
const SALT_ROUNDS = 10

export class AuthService {
 
  static async register(data: RegisterInput) {
    const { email, username, password } = data

  
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      throw new Error('User with this email or username already exists')
    }

    
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)


    const user = await db.user.create({
      data: {
        email,
        username,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true
      }
    })

    return user
  }

 
  static async login(data: LoginInput) {
    const { username, password } = data

  
    const user = await db.user.findUnique({
      where: { username }
    })

    if (!user) {
      throw new Error('Invalid username or password')
    }

  
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      throw new Error('Invalid username or password')
    }

    
    const payload: JWTPayload = {
      userId: user.id,
      username: user.username,
      email: user.email
    }

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '7d' 
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      },
      token
    }
  }

 
  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload
    } catch (error) {
      throw new Error('Invalid or expired token')
    }
  }


  static async getUserById(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        _count: {
          select: {
            workflows: true,
            credentials: true
          }
        }
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    return user
  }
}