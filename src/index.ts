import express from 'express'
import cors from 'cors'
import { testDbConnection } from './lib/db'
import authRoutes from './routes/auth'

const app = express()
const PORT = process.env.PORT || 3001


app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)


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
      health: '/health'
    }
  })
})


app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('error:', err)
  res.status(500).json({
    success: false,
    message: 'internal server erro r'
  })
})


async function startServer() {
  try {
    await testDbConnection()
    
    app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`)
      console.log(`API Documentation:`)
      console.log(`POST /api/auth/register - Register user`)
      console.log(`POST /api/auth/login - Login user`)
      console.log(`GET  /api/auth/me - Get current user (requires auth)`)
    })
  } catch (error) {
    console.error('failed to staryt the server', error)
    process.exit(1)
  }
}

startServer()