const express = require('express');
const router = express.Router();
const { 
    addItemToCart, 
    getCartItems, 
    removeCartItems 
} = require('../controllers/cart')
const { 
    requireSignin, 
    userMiddleware 
} = require('../middleware/index');


router.post('/user/cart/add', requireSignin, userMiddleware, addItemToCart);
router.get('/user/cart/get', requireSignin, userMiddleware, getCartItems);
router.post('/user/cart/remove', requireSignin, userMiddleware, removeCartItems);

module.exports = router;