import User from '../models/User'
import {NextFunction, Request, Response} from 'express'
import passport from 'passport'
import {generateRandomNumber, sendEmail} from '../middleware/mailer'


// 회원 가입
export const userSignup = async (req: Request, res:Response):Promise<any>=>{
    // user 객체 생성
    const user = new User(req.body)
    // User collection에 저장
    await user.save()
    .then(()=>{
        console.log('저장성공')
        res.send(this)
    }).catch(err=>{
        res.send(err)
    })
}

// 로그인
export const userLogin = (req: Request, res: Response, next: NextFunction)=>{
    passport.authenticate('local', (err : any, user : any, info : any)=>{
        if(err){
            return next(err)
        }
        if(!user){
            return res.json({msg : info})
        }
        
        req.logIn(user, function(err){
            if(err){
                return next(err)
            }
            return res.send('성공')
        })
    })(req,res,next)
}

// 로그아웃
export const userLogout = (req: Request, res: Response, next: NextFunction)=>{
    req.logOut(function(err){
        if(err){
            return next(err)
        }
        res.send('로그아웃')
    })
}

// 구독
export const userSubscribe = async (req: Request, res: Response)=>{
    const {userId, postId } = req.body
    const updatedSubscribe = await User.findOneAndUpdate(
        {_id : userId},
        {$addToSet : {subscribe : postId}},
        {new : true}
    )
    console.log(updatedSubscribe)
    res.send('구독 완료')
}

// 구독 취소 
export const userUnsubscribe = async (req: Request, res: Response)=>{
    const {userId, postId } = req.body
    const updatedSubscribe = await User.findOneAndUpdate(
        {_id : userId},
        {$pull : {subscribe : postId}},
        {new : true}
    )
    console.log(updatedSubscribe)
    res.send('구독 취소')
}

let verificationCode : string;
// 회원 탈퇴를 위한 메일 발송
export const sendWithdrawMail = async (req: Request, res: Response):Promise<any> => {
    const id = req.params.id
    try{
        const user = await User.findById(id)
        if(!user){
            return res.send('user를 찾을 수 없습니다')
        }

        verificationCode = generateRandomNumber() // 인증 코드 생성
        sendEmail(user.email, verificationCode) // 메일 발송
        res.send('메일 전송 성공')
    }catch(err){
        console.log(err)
    } 
}

// 탈퇴
export const userWithdraw = async (req: Request, res: Response) : Promise<any>=>{
    console.log(verificationCode)
    const code = req.body.code
    const id = req.params.id

    if(code === verificationCode){
        await User.findByIdAndDelete(id)
            .then(()=>{return res.send('탈퇴 성공')})
            .catch((err)=>{return res.send(err)})
    } else{
        return res.send('옳지 않은 코드입니다.')
    }
}

