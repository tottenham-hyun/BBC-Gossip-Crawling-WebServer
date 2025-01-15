import * as nodemailer from 'nodemailer'

//4 자리 랜덤코드 생성 함수
export const generateRandomNumber = ()=>{
    let code = ''
    for(let i=0; i<4; i++){
        code += Math.floor(Math.random()*10)
    }
    return code
}

const transport = nodemailer.createTransport({
    service : 'gmail',
    auth : {
        user : process.env.EMAIL_AUTH_USER,
        pass : process.env.EMAIL_AUTH_PASS
    }
})

export const sendEmail = (email:string, code:string)=>{
    const mailOptions = {
        from : process.env.EMAIL_AUTH_USER,
        to : email,
        subject : '회원탈퇴를 위한 인증코드 발송',
        text : `회원 탈퇴 코드 : ${code}`
    }
    transport.sendMail(mailOptions, function(err, info){
        if(err){
            console.log(err)
        } else {
            console.log('Email send: ' + info.response)
        }
    })
}

