import User from '../models/User'
import {NextFunction, Request, Response} from 'express'
import passport from 'passport'
import {isCodeValid, sendEmail, storeVerificationCode} from '../middleware/mailer'
import bcrypt from 'bcryptjs'
const saltRounds = 10

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

// 회원 정보 수정
export const userModifyInfo = async (req: Request, res : Response):Promise<any>=>{
    const id = req.params.id

    // 클라이언트에서 비밀번호 보내기 x but postman 같은걸로 수정 온다면?
    // 요청에 password가 있으면 무시하기
    if(req.body.password){
        return res.send('못 바꿔요')
    }

    try{
        const updatedUser = await User.findByIdAndUpdate(id, req.body, {new : true})

        if(!updatedUser){
            res.send('유저 없어요')
        }
        res.send(updatedUser)
    } catch(err){
        res.send(err)
    }
}

// 비밀번호 & 회원 탈퇴를 위한 메일 발송
export const sendCode = async (req: Request, res: Response): Promise<any> => {
    const id = req.params.id;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.send('user를 찾을 수 없습니다');
        }

        // id와 함께 인증 코드 생성 및 저장
        const code = storeVerificationCode(id);
        sendEmail(user.email, code); // 메일 발송
        res.send('메일 전송 성공');
    } catch (err) {
        console.log(err);
        res.send('메일 전송 실패');
    }
};

// 비밀번호 변경 (비밀번호와 인증코드를 같이 보냄)
export const userChangePassword = async (req: Request, res: Response): Promise<any> => {
    const { code, oldPassword, newPassword } = req.body;
    const id = req.params.id;

    try{
        //사용자 찾기
        const user = await User.findById(id);
        
        if(!user){
            return res.send('유저를 찾을 수 없습니다')
        }

        if (!isCodeValid(id, code)) {
            return res.send('옳지 않은 코드이거나 코드가 만료되었습니다.');
        }

        user.comparePassword(oldPassword, async(err,isMatch)=>{
            if(err){
                return res.send('비밀번호 비교 오류')
            }
            if(!isMatch){
                return res.send('비밀번호가 일치하지 않습니다.')
            }

            //새 비밀번호 암호화
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(newPassword, salt);
        
            // 새 비밀번호로 업데이트
            user.password = hash
            await user.save()
            res.send('비밀번호가 성공적으로 변경되었습니다.')
        })
    }catch(err){
        console.log(err)
        res.send('서버 오류')
    }
};

// 탈퇴
export const userWithdraw = async (req: Request, res: Response): Promise<any> => {
    const { code } = req.body;
    const id = req.params.id;

    if (!isCodeValid(id, code)) {
        return res.send('옳지 않은 코드이거나 코드가 만료되었습니다.');
    }

    try {
        await User.findByIdAndDelete(id);
        res.send('탈퇴 성공');
    } catch (err) {
        console.log(err);
        res.send('회원 탈퇴 실패');
    }
};

