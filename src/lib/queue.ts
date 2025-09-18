import { Queue, Worker, Job } from 'bullmq'
import Redis from 'ioredis'

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  retryStrategy: (times: number) => {
    
    if (times < 5) return 2000 * Math.pow(2, times); 
    return null; 
  },
})

export interface WorkflowExecutionJob {
  workflowId: string
  userId: string
  executionId: string
  triggerData?: any
  triggerType: 'manual' | 'webhook' | 'schedule'
}

export const workflowQueue = new Queue<WorkflowExecutionJob>('workflow-execution', {
  connection,
  defaultJobOptions: {
    removeOnComplete: 50, 
    removeOnFail: 20,     
    attempts: 3,          
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
})

workflowQueue.on('error', (error) => {
  console.error('Queue error:', error)
})

console.log('Workflow queue initialized')
