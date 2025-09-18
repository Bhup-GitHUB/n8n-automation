import { Router } from 'express'
import { CreateWorkflowSchema, UpdateWorkflowSchema } from '../types'
import { authMiddleware } from '@/middlewares/auth'
import { WorkflowService } from '@/services/workflow'

const router = Router()

router.use(authMiddleware)

router.get('/', async (req, res) => {
  try {
    const workflows = await WorkflowService.getUserWorkflows(req.user!.userId)
    res.json({
      success: true,
      message: 'Workflows retrieved successfully',
      data: { workflows }
    })
  } catch (error: any) {
    console.error('Get workflows error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get workflows'
    })
  }
})

router.post('/', async (req, res) => {
  try {
    const validationResult = CreateWorkflowSchema.safeParse(req.body)

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      })
    }

    const workflow = await WorkflowService.createWorkflow(
      req.user!.userId,
      validationResult.data
    )

    res.status(201).json({
      success: true,
      message: 'Workflow created successfully',
      data: { workflow }
    })
  } catch (error: any) {
    console.error('Create workflow error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create workflow'
    })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const workflow = await WorkflowService.getWorkflowById(
      req.params.id,
      req.user!.userId
    )
    res.json({
      success: true,
      message: 'Workflow retrieved successfully',
      data: { workflow }
    })
  } catch (error: any) {
    console.error('Get workflow error:', error)
    res.status(404).json({
      success: false,
      message: error.message || 'Workflow not found'
    })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const validationResult = UpdateWorkflowSchema.safeParse(req.body)

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      })
    }

    const workflow = await WorkflowService.updateWorkflow(
      req.params.id,
      req.user!.userId,
      validationResult.data
    )

    res.json({
      success: true,
      message: 'Workflow updated successfully',
      data: { workflow }
    })
  } catch (error: any) {
    console.error('Update workflow error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update workflow'
    })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const result = await WorkflowService.deleteWorkflow(
      req.params.id,
      req.user!.userId
    )
    res.json({
      success: true,
      message: result.message
    })
  } catch (error: any) {
    console.error('Delete workflow error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete workflow'
    })
  }
})

router.patch('/:id/toggle', async (req, res) => {
  try {
    const workflow = await WorkflowService.toggleWorkflow(
      req.params.id,
      req.user!.userId
    )
    res.json({
      success: true,
      message: `Workflow ${workflow.enabled ? 'enabled' : 'disabled'} successfully`,
      data: { workflow }
    })
  } catch (error: any) {
    console.error('Toggle workflow error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to toggle workflow'
    })
  }
})

router.post('/:id/duplicate', async (req, res) => {
  try {
    const workflow = await WorkflowService.duplicateWorkflow(
      req.params.id,
      req.user!.userId
    )
    res.status(201).json({
      success: true,
      message: 'Workflow duplicated successfully',
      data: { workflow }
    })
  } catch (error: any) {
    console.error('Duplicate workflow error:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to duplicate workflow'
    })
  }
})

export default router
