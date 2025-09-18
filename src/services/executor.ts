import { ExecutionService } from './execution'
import { db } from '../lib/db'

export class WorkflowExecutor {
  
  static async executeWorkflow(
    workflowId: string,
    executionId: string,
    triggerData?: any
  ) {
    console.log(`Starting workflow execution: ${workflowId}`)

    try {
      const workflow = await db.workflow.findUnique({
        where: { id: workflowId },
        include: {
          nodes: true,
          connections: true
        }
      })

      if (!workflow) {
        throw new Error('Workflow not found')
      }

      if (!workflow.enabled) {
        throw new Error('Workflow is disabled')
      }

      const triggerNodes = workflow.nodes.filter(node => node.type === 'TRIGGER')
      const actionNodes = workflow.nodes.filter(node => node.type === 'ACTION')

      console.log(`Found ${triggerNodes.length} triggers and ${actionNodes.length} actions`)

      const results = []
      
      for (const actionNode of actionNodes) {
        const result = await this.executeNode(actionNode, triggerData)
        results.push({
          nodeId: actionNode.id,
          nodeName: actionNode.name,
          success: true,
          result
        })
      }

      await ExecutionService.updateExecutionStatus(executionId, 'SUCCESS')

      console.log(`Workflow execution completed: ${workflowId}`)
      
      return {
        success: true,
        executionId,
        results
      }

    } catch (error: any) {
      console.error(`Workflow execution failed: ${workflowId}`, error.message)
      
      await ExecutionService.updateExecutionStatus(executionId, 'FAILED', error.message)
      
      throw error
    }
  }

  private static async executeNode(node: any, triggerData?: any) {
    console.log(`Executing node: ${node.name} (${node.type})`)

    const config = node.config || {}

    switch (node.type) {
      case 'ACTION':
        return this.executeActionNode(node, config, triggerData)
      
      case 'CONDITION':
        return this.executeConditionNode(node, config, triggerData)
      
      default:
        console.log(`Skipping node type: ${node.type}`)
        return { skipped: true, reason: 'Node type not implemented' }
    }
  }

  private static async executeActionNode(node: any, config: any, triggerData?: any) {
    const actionType = config.actionType || 'log'

    switch (actionType) {
      case 'http_request':
        return this.executeHttpRequest(config, triggerData)
      
      case 'log':
        return this.executeLogAction(config, triggerData)
      
      default:
        console.log(`Action type not implemented: ${actionType}`)
        return { 
          success: true, 
          message: `Action ${actionType} executed (mock)`,
          config,
          triggerData
        }
    }
  }

  private static async executeHttpRequest(config: any, triggerData?: any) {
    const { url, method = 'GET', headers = {}, body } = config

    if (!url) {
      throw new Error('HTTP request requires URL')
    }

    try {
      const response = await fetch(url, {
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: method !== 'GET' ? JSON.stringify(body || triggerData) : undefined
      })

      const result = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: await response.text()
      }

      console.log(`HTTP ${method} ${url} -> ${response.status}`)
      
      return result

    } catch (error: any) {
      throw new Error(`HTTP request failed: ${error.message}`)
    }
  }

  private static async executeLogAction(config: any, triggerData?: any) {
    const message = config.message || 'Workflow executed successfully'
    
    console.log(`Log Action: ${message}`)
    
    return {
      message,
      timestamp: new Date().toISOString(),
      triggerData
    }
  }

  private static async executeConditionNode(node: any, config: any, triggerData?: any) {
    console.log(`Condition node executed: ${node.name}`)
    
    return {
      condition: true,
      message: 'Condition evaluated'
    }
  }
}
