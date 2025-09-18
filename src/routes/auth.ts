import { Router } from 'express'
import { AuthService } from '../services/auth'
import { RegisterSchema, LoginSchema } from '../types'
import { authMiddleware } from '@/middlewares/auth'

const router = Router()


router.post('/register', async (req, res) => {
  try {
    
    const validationResult = RegisterSchema.safeParse(req.body)
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        //@ts-ignore
        errors: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      })
    }

    
    const user = await AuthService.register(validationResult.data)

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user }
    })

  } catch (error: any) {
    console.error('Registration error:', error)
    
    res.status(400).json({
      success: false,
      message: error.message || 'Registration failed'
    })
  }
})


router.post('/login', async (req, res) => {
  try {
 
    const validationResult = LoginSchema.safeParse(req.body)
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        //@ts-ignore
        errors: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      })
    }

   
    const result = await AuthService.login(validationResult.data)

    res.json({
      success: true,
      message: 'Login successful',
      data: result
    })

  } catch (error: any) {
    console.error('Login error:', error)
    
    res.status(400).json({
      success: false,
      message: error.message || 'Login failed'
    })
  }
})


router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await AuthService.getUserById(req.user!.userId)

    res.json({
      success: true,
      message: 'User data retrieved',
      data: { user }
    })

  } catch (error: any) {
    console.error('Get user error:', error)
    
    res.status(404).json({
      success: false,
      message: error.message || 'User not found'
    })
  }
})

export default router