import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import api from './routes.js'
import auth from './auth.js'
import { homePage, collectionPage, loginPage, signupPage } from './pages.js'

const PORT = process.env.PORT || 3000
const app = express()

app.set('trust proxy', true)
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

app.use('/api/auth', auth)
app.use('/api', api)

app.get('/login', (_req, res) => {
  res.type('html').send(loginPage(''))
})

app.get('/signup', (_req, res) => {
  res.type('html').send(signupPage(''))
})

app.get('/', (_req, res) => {
  res.type('html').send(homePage(''))
})

app.get('/c/:id', (req, res) => {
  res.type('html').send(collectionPage(req.params.id, ''))
})

export default app

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`PhotoShare server running on http://localhost:${PORT}`)
  })
}