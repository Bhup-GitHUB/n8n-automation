import { Worker } from 'bullmq'
import Redis from 'ioredis'
import { WorkflowExecutor } from '../services/executor'
import type { WorkflowExecutionJob } from '../lib/queue'



const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000); 
    return delay;
  }
})

export const workflowWorker = new Worker<WorkflowExecutionJob>(
  'workflow-execution',
  async (job) => {
    const { workflowId, executionId, triggerData, triggerType } = job.data

    try {
      const result = await WorkflowExecutor.executeWorkflow(
        workflowId,
        executionId,
        triggerData
      )

      return result

    } catch (error: any) {
      throw error
    }
  },
  { 
    connection,
    concurrency: 5
  }
)

workflowWorker.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed:`, result.executionId)
})

workflowWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message)
})

workflowWorker.on('error', (err) => {
  console.error('Worker error:', err)
})

console.log('Workflow worker started')
