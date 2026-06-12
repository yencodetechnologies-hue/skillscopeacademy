// require('dotenv').config()

// const express      = require('express')
// const cors         = require('cors')
// const cookieParser = require('cookie-parser')
// const helmet       = require('helmet')
// const morgan       = require('morgan')

// const connectDB = require('./config/db')

// const authRoutes        = require('./routes/authRoutes')
// const courseRoutes      = require('./routes/courseRoutes')
// const categoryRoutes    = require('./routes/categoryRoutes')
// const scheduleRoutes    = require('./routes/scheduleRoutes')
// const sitecontent       = require('./routes/sitecontent')
// const bannerRoutes      = require('./routes/bannerRoutes')
// const galleryRoutes     = require('./routes/galleryRoutes')
// const activityLogRoutes = require('./routes/activityLogRoutes')
// const vocRoutes          = require('./routes/vocRoutes')

// connectDB()

// const app = express()

// const allowedOrigins = [
//   'https://skillscopeacademy.vercel.app',
//   'https://skillscopeacademy.yencodetechnologies.in',
//   'http://localhost:5173',
//   'http://localhost:5174',
//   'http://localhost:3000',
// ]

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true)
//     } else {
//       console.log('CORS blocked:', origin)
//       callback(new Error('Not allowed by CORS'))
//     }
//   },
//   credentials: true,
// }))

// app.use(helmet())
// app.use(morgan('dev'))
// app.use(express.json())
// app.use(express.urlencoded({ extended: true }))
// app.use(cookieParser())

// app.use('/api/auth',          authRoutes)
// app.use('/api/courses',       courseRoutes)
// app.use('/api/categories',    categoryRoutes)
// app.use('/api/schedules',     scheduleRoutes)
// app.use('/api/site',          sitecontent)
// app.use('/api/banners',       bannerRoutes)
// app.use('/api/gallery',       galleryRoutes)
// app.use('/api/activity-logs', activityLogRoutes)
// app.use('/api/voc',          vocRoutes)

// app.get('/', (req, res) => res.send('API Running'))

// const PORT = process.env.PORT || 7001
// app.listen(PORT, () => {
//   console.log(`Server running on ${PORT}`)
//   console.log('Allowed origins:', allowedOrigins)
// })

require('dotenv').config()

const express      = require('express')
const cors         = require('cors')
const cookieParser = require('cookie-parser')
const helmet       = require('helmet')
const morgan       = require('morgan')

const connectDB = require('./config/db')

const authRoutes        = require('./routes/authRoutes')
const courseRoutes      = require('./routes/courseRoutes')
const categoryRoutes    = require('./routes/categoryRoutes')
const scheduleRoutes    = require('./routes/scheduleRoutes')
const sitecontent       = require('./routes/sitecontent')
const bannerRoutes      = require('./routes/bannerRoutes')
const galleryRoutes     = require('./routes/galleryRoutes')
const activityLogRoutes = require('./routes/activityLogRoutes')
const vocRoutes         = require('./routes/vocRoutes')
const paymentRoutes     = require('./routes/paymentRoutes')   // ← NEW

connectDB()

const app = express()

const allowedOrigins = [
  'https://skillscopeacademy.vercel.app',
  'https://skillscopeacademy.yencodetechnologies.in',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
]

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.log('CORS blocked:', origin)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))

app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use('/api/auth',          authRoutes)
app.use('/api/courses',       courseRoutes)
app.use('/api/categories',    categoryRoutes)
app.use('/api/schedules',     scheduleRoutes)
app.use('/api/site',          sitecontent)
app.use('/api/banners',       bannerRoutes)
app.use('/api/gallery',       galleryRoutes)
app.use('/api/activity-logs', activityLogRoutes)
app.use('/api/voc',           vocRoutes)
app.use('/api/payments',      paymentRoutes)              // ← NEW

app.get('/', (req, res) => res.send('API Running'))

const PORT = process.env.PORT || 7001
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`)
  console.log('Allowed origins:', allowedOrigins)
})