import * as dotenv from 'dotenv';
dotenv.config();
import * as nodemailer from 'nodemailer';

// 인증 코드 및 유효시간 관리
const verificationCodes: Map<string, { code: string, expiration: number }> = new Map();

// 4자리 랜덤 인증 코드 생성 함수
export const generateRandomNumber = (): string => {
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += Math.floor(Math.random() * 10); // 랜덤 0~9 생성
    }
    return code;
};

// Nodemailer를 사용한 이메일 발송 설정
const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_AUTH_USER, // 발신 이메일 주소
        pass: process.env.EMAIL_AUTH_PASS, // 발신 이메일 비밀번호
    },
});

// 이메일 발송 함수
export const sendEmail = (email: string, code: string): void => {
    const mailOptions = {
        from: process.env.EMAIL_AUTH_USER,
        to: email,
        subject: '인증코드 발송',
        text: `인증코드: ${code}\n코드 유효시간: 5분`,
    };

    transport.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error('메일 전송 오류:', err);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};

// 유효한 인증 코드인지 확인
export const isCodeValid = (userId: string, code: string): boolean => {
    const data = verificationCodes.get(userId);

    if (!data) {
        return false; // 코드가 없으면 유효하지 않음
    }

    if (Date.now() > data.expiration) {
        verificationCodes.delete(userId); // 만료된 코드 삭제
        return false; // 코드가 만료됨
    }

    return data.code === code; // 코드가 맞다면 유효
};

// 인증 코드 생성 및 저장
export const storeVerificationCode = (userId: string): string => {
    const code = generateRandomNumber(); // 인증 코드 생성
    const expiration = Date.now() + 5 * 60 * 1000; // 5분 후 만료

    verificationCodes.set(userId, { code, expiration });
    return code;
};
