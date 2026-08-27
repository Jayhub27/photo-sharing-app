import express from 'express'
import cors from 'cors'
import api from './routes.js'
import { homePage, collectionPage } from './pages.js'

const PORT = process.env.PORT || 3000
const app = express()

app.use(cors())
app.use(express.json())

app.use('/api', api)

app.get('/', (_req, res) => {
  res.type('html').send(homePage(''))
})

app.get('/c/:id', (req, res) => {
  res.type('html').send(collectionPage(req.params.id, ''))
})

app.listen(PORT, () => {
  console.log(`PhotoShare server running on http://localhost:${PORT}`)
})