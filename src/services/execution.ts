import { db } from '../lib/db'
import { workflowQueue } from '../lib/queue'

export class ExecutionService {
  
  static async createExecution(workflowId: string, triggerData?: any) {
    const execution = await db.execution.create({
      data: {
        workflowId,
        status: 'RUNNING',
        data: triggerData || {}
      }
    })
    return execution
  }

  static async updateExecutionStatus(
    executionId: string, 
    status: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED',
    error?: string
  ) {
    return db.execution.update({
      where: { id: executionId },
      data: {
        status,
        error,
        finishedAt: status !== 'RUNNING' ? new Date() : null
      }
    })
  }

  static async getExecution(executionId: string) {
    const execution = await db.execution.findUnique({
      where: { id: executionId },
      include: {
        workflow: {
          include: {
            nodes: true,
            connections: true
          }
        }
      }
    })

    if (!execution) {
      throw new Error('Execution not found')
    }

    return execution
  }

  static async getWorkflowExecutions(workflowId: string, userId: string) {
    const workflow = await db.workflow.findFirst({
      where: { id: workflowId, userId }
    })

    if (!workflow) {
      throw new Error('Workflow not found')
    }

    return db.execution.findMany({
      where: { workflowId },
      orderBy: { startedAt: 'desc' },
      take: 50
    })
  }

  static async queueWorkflow(
    workflowId: string,
    userId: string,
    triggerType: 'manual' | 'webhook' | 'schedule',
    triggerData?: any
  ) {
    const execution = await this.createExecution(workflowId, triggerData)

    const job = await workflowQueue.add('execute-workflow', {
      workflowId,
      userId,
      executionId: execution.id,
      triggerData,
      triggerType
    })

    console.log(`Workflow ${workflowId} queued for execution (Job: ${job.id})`)

    return {
      execution,
      jobId: job.id
    }
  }
}
