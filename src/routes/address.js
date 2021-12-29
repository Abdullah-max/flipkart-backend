const express = require('express');
const { addAddress, getAddress } = require('../controllers/address');
const { requireSignin, userMiddleware } = require('../middleware')
const router = express.Router();

router.post('/user/address/create', requireSignin, userMiddleware, addAddress);
router.get('/user/getaddress', requireSignin, userMiddleware, getAddress);

module.exports = router;