import { NextFunction } from 'express';
import bcrypt from 'bcryptjs'
import * as mongoose from 'mongoose'

// User 타입에 comparePassword 메서드 추가
interface IUser extends Document {
    email: string;
    password: string;
    nickname: string;
    subscribe: string[];
    comparePassword(plainPassword: string, cb: (err: Error | null, isMatch: boolean) => void): void;
}

const UserSchema = new mongoose.Schema<IUser>({
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true,
        minLength : 5
    },
    nickname : {
        type : String,
        required : true,
        unique : true,
        minLength : 4,
        maxLength : 7
    },
    subscribe : [
        {   
            type : String
        }
    ]
})

const saltRounds = 10
UserSchema.pre("save", function(next){
    let user = this;
    if(user.isModified('password')){
        bcrypt.genSalt(saltRounds, function(err, salt){
            if(err) return next(err)
            bcrypt.hash(user.password, salt, function(err, hash){
                if(err) return next(err)
                user.password = hash
                next()
            })
        })
    }
})

UserSchema.methods.comparePassword = function(plainPassword : string, cb : Function){
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return cb(err)
        cb(null, isMatch)
    })
}

const User = mongoose.model<IUser>('User', UserSchema,'User')
export default User