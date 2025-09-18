import { db } from '../lib/db'
import { ExecutionService } from './execution'
import crypto from 'crypto'

export class WebhookService {

  static async createWebhook(workflowId: string, userId: string, method: 'GET' | 'POST' = 'POST') {
    const workflow = await db.workflow.findFirst({
      where: { id: workflowId, userId }
    })

    if (!workflow) {
      throw new Error('Workflow not found')
    }

    const webhookPath = `/webhook/${crypto.randomUUID()}`

    const webhook = await db.webhook.create({
      data: {
        workflowId,
        path: webhookPath,
        method,
        enabled: true
      }
    })

    return webhook
  }

  static async getWebhookByPath(path: string) {
    const webhook = await db.webhook.findUnique({
      where: { path },
      include: {
        workflow: {
          include: {
            nodes: true,
            user: {
              select: { id: true, username: true }
            }
          }
        }
      }
    })

    return webhook
  }

  static async processWebhookTrigger(path: string, method: string, data: any, headers: any) {
    const webhook = await this.getWebhookByPath(path)

    if (!webhook) {
      throw new Error('Webhook not found')
    }

    if (!webhook.enabled) {
      throw new Error('Webhook is disabled')
    }

    if (!webhook.workflow.enabled) {
      throw new Error('Workflow is disabled')
    }

    if (webhook.method !== method.toUpperCase()) {
      throw new Error(`Method not allowed. Expected ${webhook.method}, got ${method}`)
    }

    const triggerData = {
      webhook: {
        path: webhook.path,
        method: webhook.method,
        receivedAt: new Date().toISOString()
      },
      body: data,
      headers: headers,
      query: {}
    }

    const result = await ExecutionService.queueWorkflow(
      webhook.workflowId,
      webhook.workflow.userId,
      'webhook',
      triggerData
    )

    console.log(`Webhook triggered: ${path} -> Workflow: ${webhook.workflowId}`)

    return {
      message: 'Webhook received and workflow queued',
      executionId: result.execution.id,
      jobId: result.jobId
    }
  }

  static async getWorkflowWebhooks(workflowId: string, userId: string) {
    const workflow = await db.workflow.findFirst({
      where: { id: workflowId, userId }
    })

    if (!workflow) {
      throw new Error('Workflow not found')
    }

    return db.webhook.findMany({
      where: { workflowId },
      orderBy: { createdAt: 'desc' }
    })
  }

  static async deleteWebhook(webhookId: string, userId: string) {
    const webhook = await db.webhook.findFirst({
      where: { 
        id: webhookId,
        workflow: { userId }
      }
    })

    if (!webhook) {
      throw new Error('Webhook not found')
    }

    await db.webhook.delete({
      where: { id: webhookId }
    })

    return { message: 'Webhook deleted successfully' }
  }

  static async toggleWebhook(webhookId: string, userId: string) {
    const webhook = await db.webhook.findFirst({
      where: { 
        id: webhookId,
        workflow: { userId }
      }
    })

    if (!webhook) {
      throw new Error('Webhook not found')
    }

    const updatedWebhook = await db.webhook.update({
      where: { id: webhookId },
      data: { enabled: !webhook.enabled }
    })

    return updatedWebhook
  }
}
