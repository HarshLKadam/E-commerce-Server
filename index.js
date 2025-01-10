import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import cookieParser from 'cookie-parser'
import morgon from 'morgan'
import helmet from 'helmet'
import connectDB from './config/connectdb.js'
import userRouter from './routes/user.route.js'

const app=express()

app.use(cors());

app.options('*',cors())

app.use(express.json())

app.use(cookieParser())

app.use(helmet({
    crossOriginOpenerPolicy:false
}))

const PORT=process.env.PORT || 8000

app.get('/',(req,res)=>{
    res.json({
        'message':"server is running"+PORT
    })
})

app.use('/api/user',userRouter)

connectDB()
.then(()=>{
    app.listen(PORT,()=>{
        console.log(`app is listining on ${PORT}`)
    })
})
.catch()