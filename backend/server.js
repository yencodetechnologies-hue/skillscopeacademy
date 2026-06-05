// require('dotenv').config()

// const express      = require('express')
// const cors         = require('cors')
// const cookieParser = require('cookie-parser')
// const helmet       = require('helmet')
// const morgan       = require('morgan')

// const connectDB = require('./config/db')

// // ── Route imports ─────────────────────────────────────────────
// const authRoutes         = require('./routes/authRoutes')
// const courseRoutes       = require('./routes/courseRoutes')
// const categoryRoutes     = require('./routes/categoryRoutes')
// const scheduleRoutes     = require('./routes/scheduleRoutes')
// const sitecontent  = require('./routes/sitecontent')
// const bannerRoutes       = require('./routes/bannerRoutes')       // NEW
// const galleryRoutes      = require('./routes/galleryRoutes')      // NEW
// const activityLogRoutes  = require('./routes/activityLogRoutes')  // NEW

// connectDB()

// const app = express()

// // ── Core middleware ───────────────────────────────────────────
// app.use(express.json())
// app.use(express.urlencoded({ extended: true }))
// app.use(cookieParser())
// app.use(helmet())
// app.use(morgan('dev'))

// app.use(cors({
//   origin:      process.env.CLIENT_ORIGIN.split(','),
//   credentials: true,
// }))


// // ── Routes ───────────────────────────────────────────────────
// app.use('/api/auth',           authRoutes)
// app.use('/api/courses',        courseRoutes)
// app.use('/api/categories',     categoryRoutes)
// app.use('/api/schedules',      scheduleRoutes)
// app.use('/api/site',           sitecontent)
// app.use('/api/banners',        bannerRoutes)        // NEW
// app.use('/api/gallery',        galleryRoutes)       // NEW
// app.use('/api/activity-logs',  activityLogRoutes)   // NEW

// app.get('/', (req, res) => res.send('API Running'))

// const PORT = process.env.PORT || 7001
// app.listen(PORT, () => console.log(`Server running on ${PORT}`))

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

connectDB()

const app = express()

const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174']

// ── CORS must come BEFORE helmet and all routes ──
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

app.get('/', (req, res) => res.send('API Running'))

const PORT = process.env.PORT || 7001
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`)
  console.log('Allowed origins:', allowedOrigins)
})