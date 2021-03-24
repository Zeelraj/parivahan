const UserProfile = require("./models/UserProfile");
const bcrypt = require("bcryptjs");
const localStrategy = require("passport-local").Strategy;
const JwtStrategy = require('passport-jwt').Strategy;

const cookieExtractor = req =>{
    let token = null;
    if(req && req.cookies){
        token = req.cookies["access_token"];        
    }
    return token;
}

module.exports = function (passport) {
    // Authorization
    passport.use(new JwtStrategy({
        jwtFromRequest : cookieExtractor,
        secretOrKey : 'q5gcejav4tz982r10dhz907f5ta6fdgg2800te3fc7ldm27qv3'
    },(payload,done)=>{
        UserProfile.findById({_id : payload.sub},(err,user)=>{
            if(err)
                return done(err,false);
            if(user)
                return done(null,user);
            else
                return done(null,false);
        });
    }));

    // Authentication using Email and Password
    passport.use(
        new localStrategy((username, password, done) => {
            UserProfile.findOne({ email: username }, (err, user) => {
                if (err) throw err;
                if (!user) return done(null, false);
                // return done(null, user);
                bcrypt.compare(password, user.password, (err, result) => {
                    if (err) throw err;
                    if (result === true) {
                        return done(null, user);
                    } else {
                        return done(null, false);
                    }
                });
            });
        })
    );

    passport.serializeUser((user, cb) => {
        cb(null, user.id);
    });
    passport.deserializeUser((id, cb) => {
        UserProfile.findOne({ _id: id }, (err, user) => {
            cb(err, user);
        });
    });
};