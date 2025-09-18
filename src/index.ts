import express from 'express'
import cors from 'cors';

import { testDbConnection } from './lib/db'

const app= express()
const PORT = 3000


app.use(cors())
app.use(express.json())

app.get("/health",(req,res)=>{
    res.json({
        message:"backed is working ->health endpoint "

    })
})

app.get('/', (req, res) => {
    res.json({ 
      message: 'N8N Automation Platform API',
      version: '1.0.0'
    })
  })

  async function startServer() {
    try {
     
      await testDbConnection()
      
      app.listen(PORT, () => {
        console.log(`working on  http://localhost:${PORT}`)
      })
    } catch (error) {
      console.error('server failed to start please check the logs', error)
      process.exit(1)
    }
  }
  

startServer()

