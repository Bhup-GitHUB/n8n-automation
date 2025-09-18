import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/auth'


declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string
        username: string
        email: string
      }
    }
  }
}

export const authMiddleware = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      })
    }

    
    const token = authHeader.substring(7)

    
    const decoded = AuthService.verifyToken(token)

   
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email
    }

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    })
  }
}


export const optionalAuth = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const decoded = AuthService.verifyToken(token)
      
      req.user = {
        userId: decoded.userId,
        username: decoded.username,
        email: decoded.email
      }
    }
  } catch (error) {
   
  }
  
  next()
}