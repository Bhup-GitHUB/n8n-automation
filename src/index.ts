import express from 'express'
import cors from 'cors'
import { testDbConnection } from './lib/db'

import authRoutes from './routes/auth'
import workflowRoutes from './routes/workflow'
import triggerRoutes from './routes/triggers'

import './queue/worker'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/workflows', workflowRoutes)
app.use('/api/triggers', triggerRoutes)

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'N8N Automation Platform'
  })
})

app.get('/', (req, res) => {
  res.json({ 
    message: 'N8N Automation Platform API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      workflows: '/api/workflows',
      triggers: '/api/triggers',
      health: '/health'
    }
  })
})

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  })
})

async function startServer() {
  try {
    await testDbConnection()
    
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
      console.log(`Queue worker started and ready`)
      console.log(`New API Endpoints:`)
      console.log(`   POST /api/triggers/manual/:workflowId - Execute workflow manually`)
      console.log(`   POST /api/triggers/webhook/:workflowId - Create webhook`)
      console.log(`   ALL  /api/triggers/webhook/* - Webhook trigger (public)`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
