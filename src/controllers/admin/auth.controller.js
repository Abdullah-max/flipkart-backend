const User = require('../../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.signup = (req, res) => {
    User.findOne({ email: req.body.email })
    .exec(async (error, user) => {
        if(user) return res.status(400).json({
            massege: 'Admin already registered'
        });
        const {
            firstName,
            lastName,
            email,
            password
        } = req.body;
        const hash_password = await bcrypt.hash(password, 10)
        const _user = new User({ 
            firstName,
            lastName,
            email,
            hash_password,
            userName: Math.random().toString(),
            role: 'admin'
         });

         _user.save((error, data) => {
             if(error){
                 return res.status(400).json({
                     message: 'Something went wrong'
                 });
             }
             if(data){
                 return res.status(201).json({
                     message: 'Admin created successfully!'
                 })
             }
         })
    })
}

exports.signin = (req, res) => {
    User.findOne({ email: req.body.email })
    .exec((error, user) => {
        if(error) return res.status(400).json({ error });
        if(user && user.authenticate(req.body.password) && user.role === 'admin'){
            const token = jwt.sign({ _id: user._id, role: user.role }, process.env.TOKEN, {expiresIn: '30d'});
            res.cookie('token', token, {
                expiresIn: '30d'
            })
            const { _id, firstName, lastName, fullName, email, role } = user;
            res.status(200).json({
                token,
                user: {
                    _id, firstName, lastName, fullName, email, role
                }
            })
        }else{
            return res.status(400).json({
                massege: 'Password or Email is wrong!'
            });
        }
    });
}

// exports.requireSignin = (req, res, next) => {
//     const token = req.headers.authorization.split(' ')[1];
//     const user = jwt.verify(token, process.env.TOKEN)
//     req.user = user
//     next()
//     // jwt.decode()
// }

exports.signout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({
        message: 'Signout successfully...',
    });
};