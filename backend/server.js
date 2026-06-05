require('dotenv').config()

const express      = require('express')
const cors         = require('cors')
const cookieParser = require('cookie-parser')
const helmet       = require('helmet')
const morgan       = require('morgan')

const connectDB = require('./config/db')

// ── Route imports ─────────────────────────────────────────────
const authRoutes         = require('./routes/authRoutes')
const courseRoutes       = require('./routes/courseRoutes')
const categoryRoutes     = require('./routes/categoryRoutes')
const scheduleRoutes     = require('./routes/scheduleRoutes')
const sitecontent  = require('./routes/sitecontent')
const bannerRoutes       = require('./routes/bannerRoutes')       // NEW
const galleryRoutes      = require('./routes/galleryRoutes')      // NEW
const activityLogRoutes  = require('./routes/activityLogRoutes')  // NEW

connectDB()

const app = express()

// ── Core middleware ───────────────────────────────────────────
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(helmet())
app.use(morgan('dev'))

app.use(cors({
  origin:      process.env.CLIENT_ORIGIN.split(','),
  credentials: true,
}))

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth',           authRoutes)
app.use('/api/courses',        courseRoutes)
app.use('/api/categories',     categoryRoutes)
app.use('/api/schedules',      scheduleRoutes)
app.use('/api/site',           sitecontent)
app.use('/api/banners',        bannerRoutes)        // NEW
app.use('/api/gallery',        galleryRoutes)       // NEW
app.use('/api/activity-logs',  activityLogRoutes)   // NEW

app.get('/', (req, res) => res.send('API Running'))

const PORT = process.env.PORT || 7001
app.listen(PORT, () => console.log(`Server running on ${PORT}`))