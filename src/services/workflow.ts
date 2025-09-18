import { db } from '../lib/db'
import { CreateWorkflowInput, UpdateWorkflowInput } from '../types'

export class WorkflowService {
  static async createWorkflow(userId: string, data: CreateWorkflowInput) {
    const { title, description, enabled, nodes, connections } = data
    await this.validateWorkflow(nodes, connections)

    const workflow = await db.$transaction(async (tx) => {
      const newWorkflow = await tx.workflow.create({
        data: {
          title,
          description,
          enabled,
          userId
        }
      })

      const createdNodes = await Promise.all(
        nodes.map(node => 
          tx.node.create({
            data: {
              workflowId: newWorkflow.id,
              type: node.type as 'TRIGGER' | 'ACTION' | 'CONDITION',
              name: node.name,
              position: node.position,
              config: node.config as Record<string, any>
            }
          })
        )
      )

      if (connections.length > 0) {
        await Promise.all(
          connections.map(connection => 
            tx.connection.create({
              data: {
                workflowId: newWorkflow.id,
                sourceId: connection.sourceId,
                targetId: connection.targetId
              }
            })
          )
        )
      }

      return tx.workflow.findUnique({
        where: { id: newWorkflow.id },
        include: {
          nodes: true,
          connections: true,
          _count: {
            select: {
              executions: true
            }
          }
        }
      })
    })

    return workflow
  }

  static async getUserWorkflows(userId: string) {
    return db.workflow.findMany({
      where: { userId },
      include: {
        nodes: {
          select: {
            id: true,
            type: true,
            name: true
          }
        },
        _count: {
          select: {
            executions: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })
  }

  static async getWorkflowById(workflowId: string, userId: string) {
    const workflow = await db.workflow.findFirst({
      where: { 
        id: workflowId,
        userId
      },
      include: {
        nodes: true,
        connections: true,
        webhooks: true,
        executions: {
          select: {
            id: true,
            status: true,
            startedAt: true,
            finishedAt: true
          },
          orderBy: { startedAt: 'desc' },
          take: 10
        }
      }
    })

    if (!workflow) {
      throw new Error('Workflow not found')
    }

    return workflow
  }

  static async updateWorkflow(workflowId: string, userId: string, data: UpdateWorkflowInput) {
    const existingWorkflow = await db.workflow.findFirst({
      where: { id: workflowId, userId }
    })

    if (!existingWorkflow) {
      throw new Error('Workflow not found')
    }

    const { nodes, connections, ...workflowData } = data

    const updatedWorkflow = await db.$transaction(async (tx) => {
      await tx.workflow.update({
        where: { id: workflowId },
        data: workflowData
      })

      if (nodes) {
        await tx.connection.deleteMany({ where: { workflowId } })
        await tx.node.deleteMany({ where: { workflowId } })

        await Promise.all(
          nodes.map(node =>
            tx.node.create({
              data: {
                workflowId,
                //@ts-ignore
                type: node.type,
                name: node.name,
                position: node.position,
                //@ts-ignore
                config: node.config
              }
            })
          )
        )
      }

      if (connections) {
        await tx.connection.deleteMany({ where: { workflowId } })

        if (connections.length > 0) {
          await Promise.all(
            connections.map(connection =>
              tx.connection.create({
                data: {
                  workflowId,
                  sourceId: connection.sourceId,
                  targetId: connection.targetId
                }
              })
            )
          )
        }
      }

      return tx.workflow.findUnique({
        where: { id: workflowId },
        include: {
          nodes: true,
          connections: true
        }
      })
    })

    return updatedWorkflow
  }

  static async deleteWorkflow(workflowId: string, userId: string) {
    const workflow = await db.workflow.findFirst({
      where: { id: workflowId, userId }
    })

    if (!workflow) {
      throw new Error('Workflow not found')
    }

    await db.workflow.delete({
      where: { id: workflowId }
    })

    return { message: 'Workflow deleted successfully' }
  }

  static async toggleWorkflow(workflowId: string, userId: string) {
    const workflow = await db.workflow.findFirst({
      where: { id: workflowId, userId }
    })

    if (!workflow) {
      throw new Error('Workflow not found')
    }

    const updatedWorkflow = await db.workflow.update({
      where: { id: workflowId },
      data: { enabled: !workflow.enabled }
    })

    return updatedWorkflow
  }

  static async duplicateWorkflow(workflowId: string, userId: string) {
    const originalWorkflow = await this.getWorkflowById(workflowId, userId)

    const duplicateData: CreateWorkflowInput = {
      title: `${originalWorkflow.title} (Copy)`,
      description: originalWorkflow.description || undefined,
      enabled: false,
      nodes: originalWorkflow.nodes.map(node => ({
        type: node.type as 'TRIGGER' | 'ACTION' | 'CONDITION',
        name: node.name,
        position: node.position as { x: number; y: number },
        config: node.config as Record<string, any>
      })),
      connections: originalWorkflow.connections.map(conn => ({
        sourceId: conn.sourceId,
        targetId: conn.targetId
      }))
    }

    return this.createWorkflow(userId, duplicateData)
  }

  private static async validateWorkflow(nodes: any[], connections: any[]) {
    const triggerNodes = nodes.filter(n => n.type === 'TRIGGER')
    if (triggerNodes.length === 0) {
      throw new Error('Workflow must have at least one trigger node')
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i]
        const node2 = nodes[j]
        const distance = Math.sqrt(
          Math.pow(node1.position.x - node2.position.x, 2) +
          Math.pow(node1.position.y - node2.position.y, 2)
        )
        if (distance < 50) {
          throw new Error('Nodes are positioned too close together')
        }
      }
    }

    const nodeIds = new Set(nodes.map(n => n.id).filter(Boolean))
    for (const connection of connections) {
      if (!nodeIds.has(connection.sourceId) || !nodeIds.has(connection.targetId)) {
        throw new Error('Connection references non-existent node')
      }
    }
  }
}
