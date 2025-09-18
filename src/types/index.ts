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

export const NodeSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['TRIGGER', 'ACTION', 'CONDITION']),
  name: z.string().min(1, 'Node name is required'),
  position: z.object({
    x: z.number(),
    y: z.number()
  }),
  config: z.record(z.string(), z.unknown()).default({})
})

export const ConnectionSchema = z.object({
  id: z.string().optional(),
  sourceId: z.string(),
  targetId: z.string()
})

export const CreateWorkflowSchema = z.object({
  title: z.string().min(1, 'Workflow title is required').max(100),
  description: z.string().max(500).optional(),
  enabled: z.boolean().default(false),
  nodes: z.array(NodeSchema).min(1, 'At least one node is required'),
  connections: z.array(ConnectionSchema).default([])
})

export const UpdateWorkflowSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  enabled: z.boolean().optional(),
  nodes: z.array(NodeSchema.extend({ id: z.string() })).optional(),
  connections: z.array(ConnectionSchema.extend({ id: z.string() })).optional()
})

export type NodeInput = z.infer<typeof NodeSchema>
export type ConnectionInput = z.infer<typeof ConnectionSchema>
export type CreateWorkflowInput = z.infer<typeof CreateWorkflowSchema>
export type UpdateWorkflowInput = z.infer<typeof UpdateWorkflowSchema>

export const TRIGGER_TYPES = {
  MANUAL: 'manual',
  WEBHOOK: 'webhook',
  SCHEDULE: 'schedule',
  EMAIL: 'email_received'
} as const

export const ACTION_TYPES = {
  HTTP_REQUEST: 'http_request',
  SEND_EMAIL: 'send_email',
  SLACK_MESSAGE: 'slack_message',
  WEBHOOK: 'send_webhook'
} as const
