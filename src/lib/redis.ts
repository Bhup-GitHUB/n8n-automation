import Redis from 'ioredis'
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,  //abhi ke liye null for bullmq compatibitliy
})


redis.on('connect', () => {
  console.log('redis connected')
})

redis.on('error', (err) => {
  console.error('redis connection error ', err)
})

export default redis