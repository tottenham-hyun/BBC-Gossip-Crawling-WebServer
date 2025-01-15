import {NextFunction, Request, Response} from 'express'

// 로그인한 사람만 접근 가능
export const checkAuthenticated = (req: Request,res: Response,next: NextFunction)=>{
    if(req.isAuthenticated()) {
        return next()
    }
    res.send('로그인하세요')
    // res.redirect('/login')
}

// 로그인 안한 사람만 접근 가능
export const checkNotAuthenticated = (req: Request, res: Response,next : NextFunction)=>{
    if(req.isAuthenticated()) {
        res.send('로그인 했구나')
        return res.redirect('/');
    }
    next();
}
