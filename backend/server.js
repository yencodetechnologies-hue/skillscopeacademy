require('dotenv').config()

const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const morgan = require('morgan')

const connectDB = require('./config/db')

const authRoutes = require('./routes/authRoutes')
const courseRoutes = require('./routes/courseRoutes')
const categoryRoutes=require('./routes/categoryRoutes')
const scheduleRoutes=require('./routes/scheduleRoutes')
const siteContentRoutes = require('./routes/siteContentRoutes')


console.log("type off schedule",typeof scheduleRoutes)
console.log("scheeddrouttes",scheduleRoutes)

connectDB()

const app = express()


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(helmet())
app.use(morgan('dev'))

app.use(cors({
  origin: process.env.CLIENT_ORIGIN.split(','),
  credentials: true,
}))

app.use('/api/auth', authRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/schedules', scheduleRoutes)
app.use('/api/site', siteContentRoutes)


app.use('/api/categories', categoryRoutes)
app.get('/', (req, res) => {
  res.send('API Running')
})
const PORT = process.env.PORT || 7000

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`)
})
