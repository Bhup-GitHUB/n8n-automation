import { Router } from 'express'
import { WebhookService } from '../services/webhook'
import { ExecutionService } from '../services/execution'
import { authMiddleware } from '@/middlewares/auth'


const router = Router()

router.post('/manual/:workflowId', authMiddleware, async (req, res) => {
  try {
    const { workflowId } = req.params
    const triggerData = req.body

    const result = await ExecutionService.queueWorkflow(
      workflowId,
      req.user!.userId,
      'manual',
      triggerData
    )

    res.json({
      success: true,
      message: 'Workflow queued for manual execution',
      data: {
        executionId: result.execution.id,
        jobId: result.jobId
      }
    })

  } catch (error: any) {
    console.error('Manual execution error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to execute workflow'
    })
  }
})

router.post('/webhook/:workflowId', authMiddleware, async (req, res) => {
  try {
    const { workflowId } = req.params
    const { method = 'POST' } = req.body

    const webhook = await WebhookService.createWebhook(
      workflowId,
      req.user!.userId,
      method
    )

    res.status(201).json({
      success: true,
      message: 'Webhook created successfully',
      data: { webhook }
    })

  } catch (error: any) {
    console.error('Create webhook error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create webhook'
    })
  }
})

router.get('/webhook/:workflowId', authMiddleware, async (req, res) => {
  try {
    const { workflowId } = req.params

    const webhooks = await WebhookService.getWorkflowWebhooks(
      workflowId,
      req.user!.userId
    )

    res.json({
      success: true,
      message: 'Webhooks retrieved successfully',
      data: { webhooks }
    })

  } catch (error: any) {
    console.error('Get webhooks error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get webhooks'
    })
  }
})

router.all('/webhook/*', async (req, res) => {
  try {
    const webhookPath = req.path
    const method = req.method
    const data = req.body
    const headers = req.headers

    const result = await WebhookService.processWebhookTrigger(
      webhookPath,
      method,
      data,
      headers
    )

    res.json({
      success: true,
      ...result
    })

  } catch (error: any) {
    console.error('Webhook trigger error:', error)
    
    const statusCode = error.message.includes('not found') ? 404 :
                      error.message.includes('disabled') ? 403 :
                      error.message.includes('Method not allowed') ? 405 : 400

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Webhook processing failed'
    })
  }
})

router.get('/execution/:executionId', authMiddleware, async (req, res) => {
  try {
    const execution = await ExecutionService.getExecution(req.params.executionId)

    if (execution.workflow.userId !== req.user!.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    res.json({
      success: true,
      message: 'Execution retrieved successfully',
      data: { execution }
    })

  } catch (error: any) {
    console.error('Get execution error:', error)
    res.status(404).json({
      success: false,
      message: error.message || 'Execution not found'
    })
  }
})

export default router
