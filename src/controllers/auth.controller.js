const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const shortid = require('shortid');
const bcrypt = require('bcrypt');
const mailgun = require("mailgun-js");
const _ = require('lodash')


// without varification
// exports.signup = (req, res) => {
//     User.findOne({ email: req.body.email })
//     .exec(async (error, user) => {
//         if(user) return res.status(400).json({
//             massege: 'User already registered'
//         });
//         const {
//             firstName,
//             lastName,
//             email,
//             password
//         } = req.body;
//         const hash_password = await bcrypt.hash(password, 10)
//         const _user = new User({ 
//             firstName,
//             lastName,
//             email,
//             hash_password,
//             userName: shortid.generate()
//          });

//          _user.save((error, data) => {
//              if(error){
//                  return res.status(400).json({
//                      message: 'Something went wrong'
//                  });
//              }
//              if(data){
//                  return res.status(201).json({
//                      massege: 'User created successfully!'
//                  })
//              }
//          })
//     })
// }

// with varification
const DOMAIN = 'sandbox920ea0d9647347378d9fe9ee70918711.mailgun.org';
const mg = mailgun({apiKey: '6f6eb6bc8a70001ab2ebf3bcd388f291-1d8af1f4-eb67ec05', domain: DOMAIN});
exports.signup = (req, res) => {
    User.findOne({ email: req.body.email })
    .exec(async (error, user) => {
        if(user) return res.status(400).json({
            massege: 'User already registered'
        });
        const {
            firstName,
            lastName,
            email,
            password
        } = req.body;
        const token = jwt.sign({firstName, lastName, email, password}, process.env.TOKEN, {expiresIn: '20m'});
        const data = {
            from: 'rahim7688@gmail.com',
            to: email,
            subject: 'verify your account',
            html: `
                <h2>Please click on given link to active your account:</h2>
                <p>${process.env.API}/authentication/active/${token}</p>
            `
        };
        mg.messages().send(data, function (error, body) {
            if(error){
                return res.json({
                    error: error.message
                })
            }
            return res.json({message: 'Email has been sent, kindly active your account'})
        });

        // const hash_password = await bcrypt.hash(password, 10)
        // const _user = new User({ 
        //     firstName,
        //     lastName,
        //     email,
        //     hash_password,
        //     userName: shortid.generate()
        //  });

        //  _user.save((error, data) => {
        //      if(error){
        //          return res.status(400).json({
        //              message: 'Something went wrong'
        //          });
        //      }
        //      if(data){
        //          return res.status(201).json({
        //              massege: 'User created successfully!'
        //          })
        //      }
        //  })
    })
}


// activation

exports.activateAccount = (req, res) => {
    const {token} = req.body;
    if(token){
        jwt.verify(token, process.env.TOKEN, function(err, decodedToken){
            if(err){
                res.status(400).json({err: 'Incorrect or expired link'})
            }
            const { firstName, lastName, email, password} = decodedToken;
            User.findOne({ email: req.body.email })
            .exec(async (error, user) => {
                if(user) return res.status(400).json({
                    massege: 'User already registered'
                });
                const hash_password = await bcrypt.hash(password, 10)
                const _user = new User({ 
                    firstName,
                    lastName,
                    email,
                    hash_password,
                    userName: shortid.generate()
                });
                _user.save((error, data) => {
                    if(error){
                        console.log('error in signup while account activation: ', error)
                        return res.status(400).json({
                            message: 'error activating account'
                        });
                    }
                    if(data){
                        return res.status(201).json({
                            massege: 'User created successfully!'
                        })
                    }
                })
                })
    })
}
}

// exports.activateAccount = (req, res)=> {
//     const {token} =  req.body;
//     if(token){
//         jwt.verify(token, process.env.TOKEN, function(err, decodedToken){

//         })
//     }
// }

// sign in
exports.signin = (req, res) => {
    User.findOne({ email: req.body.email })
    .exec((error, user) => {
        if(error) return res.status(400).json({ error });
        if(user && user.authenticate(req.body.password ) && user.role === 'user'){
            const token = jwt.sign({ _id: user._id, role: user.role }, process.env.TOKEN, {expiresIn: '1d'});
            const { _id, firstName, lastName, fullName, email, role, userName } = user;
            res.status(200).json({
                token,
                user: {
                    _id, firstName, lastName, fullName, email, role, userName
                }
            })
        }else{
            return res.status(400).json({
                massege: 'Something went wrong!'
            });
        }
    });
}



// forget password

exports.forgotPassword = (req, res) => {
    const {email} = req.body;
    User.findOne({email}, (error, user) => {
        if(error || !user){
            return res.status(400).json({error: 'User with this email does not exists.'});
        }
        const token = jwt.sign({_id: user._id}, process.env.RESET_PASSWORD_KEY, {expiresIn: '20m'});
        const data = {
            from: 'rahim7688@gmail.com',
            to: email,
            subject: 'Reset your password',
            html: `
                <h2>Please click on given link to reset your password:</h2>
                <p>${process.env.API}/resetpassword/${token}</p>
            `
        };
        return user.updateOne({resetLink: token})
        .exec((error, success) => {
            if(error){
                return res.status(400).json({ error: 'reset password link error'})
            }
            if(success){
                mg.messages().send(data, function (error, body) {
                    if(error){
                        return res.json({
                            error: error.message
                        })
                    }
                    return res.json({message: 'Email has been sent, kindly follow the instructions.'})
                });
            }
        })
    })
}

exports.resetPassword = (req, res) => {
    const { resetLink, newPass } = req.body;
    if(resetLink){
        jwt.verify(resetLink, process.env.RESET_PASSWORD_KEY, function(error, decodedData){
            if(error){
                return res.status(401).json({
                    error: 'Incorrect token or it is expired'
                })
            }
            User.findOne({resetLink}).exec((error, user) => {
                if(error){
                    return res.status(400).json({error: 'User with this token does not exist'});
                }
                if(user){

                    const obj = {
                        password: newPass,
                        resetLink: ''
                    }
                    user = _.extend(user, obj);
                    user.save((error, result) => {
                        if(error){
                            return res.status(400).json({ error: 'reset password link error'})
                        }
                        if(result){
                            return res.status(201).json({message: 'your password has been changed'})
                        }
                    })
                }
            })
        })
    }
}