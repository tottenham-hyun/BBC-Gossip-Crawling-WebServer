import passport from 'passport'
import {Strategy as LocalStrategy} from 'passport-local'
import User from '../models/User'

// req.login(uer)
passport.serializeUser((user: any,done: Function)=>{
    done(null, user.id)
})

// client -> session -> request
passport.deserializeUser((id, done)=>{
    User.findById(id)
    .then(user => {
        done(null, user)
    })
})


passport.use('local', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password'
},(email, password, done)=>{
    User.findOne({email : email.toLocaleLowerCase()})
        .then(user => {
            if (!user) {
                return done(null, false, { msg : `Email ${email} not found` } as any);
            }
            user.comparePassword(password, (err:Error | null, isMatch:boolean)=>{
                if(err) return done(err)

                if(isMatch){
                    return done(null,user)
                }
                return done(null, false, {msg: 'Invalid email'} as any)
            })
        })
        .catch(err =>{
            return done(err)
        })
}))