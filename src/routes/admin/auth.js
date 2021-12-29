const express = require('express');
const router = express.Router();
const { signup, signin, signout } = require('../../controllers/admin/auth.controller')

router.post('/admin/signin', signin);

router.post('/admin/signup', signup);

router.post('/admin/signout', signout);

// router.post('/profile', requireSignin, (req, res) => {
//     res.status(200).json({
//         profile : 'user'
//     })
// })

module.exports = router;