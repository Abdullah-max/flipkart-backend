const express = require('express');
const router = express.Router();
const { initialData } = require('../../controllers/admin/initialData');
const { requireSignin, adminMiddleware } = require('../../middleware');

router.post('/initialdata', requireSignin, adminMiddleware, initialData);


module.exports = router;