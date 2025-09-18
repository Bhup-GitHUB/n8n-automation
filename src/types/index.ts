import { z } from 'zod'


export const RegisterSchema = z.object({
  email: z.string(),
  username: z.string(),
  password: z.string().min(1, 'password required')
})


export const LoginSchema = z.object({
  username: z.string(),
  password: z.string().min(1, 'password required'),
})


export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>


export interface JWTPayload {
  userId: string
  username: string
  email: string
  iat?: number
  exp?: number
}


export interface AuthenticatedRequest extends Request {
  user?: JWTPayload
}