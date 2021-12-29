const express = require('express');
const router = express.Router();
const { signup, signin, activateAccount, forgotPassword, resetPassword } = require('../controllers/auth.controller')
const { validateSigninRequest, validateSignupRequest, isRequestValidated } = require('../validators/auth');


router.post('/signin', validateSigninRequest, isRequestValidated, signin);
router.post('/signup', validateSignupRequest, isRequestValidated, signup);
router.post('/email-active', activateAccount);
// router.get ('/authentication/active/:token')
router.put('/forgot-password', forgotPassword)
router.put('/reset-password', resetPassword)

// router.post('/profile', requireSignin, (req, res) => {
//     res.status(200).json({
//         profile : 'user'
//     })
// })

module.exports = router;