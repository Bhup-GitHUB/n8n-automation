import express from 'express'
import cors from 'cors'
import { testDbConnection } from './lib/db'
import authRoutes from './routes/auth'
import workflowRoutes from './routes/workflow'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/workflows', workflowRoutes)

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
      console.log(`API Endpoints:`)
      console.log(`   POST /api/auth/register - Register user`)
      console.log(`   POST /api/auth/login - Login user`)
      console.log(`   GET  /api/auth/me - Get current user`)
      console.log(`   GET  /api/workflows - Get user workflows`)
      console.log(`   POST /api/workflows - Create workflow`)
      console.log(`   GET  /api/workflows/:id - Get workflow`)
      console.log(`   PUT  /api/workflows/:id - Update workflow`)
      console.log(`   DELETE /api/workflows/:id - Delete workflow`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
