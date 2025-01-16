import { initializeSocket } from './socket/socketIndex';
import express, {Express} from 'express';
import path from 'path';
import mongoose from 'mongoose';
import articleRouter from './routes/articleRouter'
import userRouter from './routes/userRouter'
import passport from 'passport';
import cookieSession from 'cookie-session'
import dotenv from 'dotenv'
import http from 'http'
import { Request, Response } from 'express';

dotenv.config()
const app : Express = express();
const port = 3000;
const cookieEncryptionKey = "supersecret-key"

// http 서버 생성
const server = http.createServer(app)

// socket.io 초기화
initializeSocket(server)

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/',(req:Request,res:Response)=>{
    res.render('index')
})

// 미들웨어 
app.use(cookieSession({
    keys: [cookieEncryptionKey]
}))

app.use(function(request, response, next) {
    if (request.session && !request.session.regenerate) {
        request.session.regenerate = (cb:Function) => {
            cb()
        }
    }
    if (request.session && !request.session.save) {
        request.session.save = (cb:Function) => {
            cb()
        }
    }
    next()
})

app.use(passport.initialize())
app.use(passport.session())

app.use(express.json())
app.use(express.static(path.join(__dirname,'public')))
app.use(express.urlencoded({extended : true}))
require('./middleware/passport')

// 라우터
app.use('/article', articleRouter)
app.use('/user', userRouter)

// DB 연결
mongoose.connect(process.env.DB_URI as string)
    .then(()=> console.log('DB 연결'))
    .catch((err)=> console.log(err))

// 서버 시작
server.listen(port, ()=>{
    console.log('서버 시작')
})
