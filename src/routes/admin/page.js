const express = require('express');
const { requireSignin, adminMiddleware, upload } = require('../../middleware');
const { createPage, getPage } = require('../../controllers/admin/page');
const router = express.Router();

router.post('/page/create', requireSignin, adminMiddleware, upload.fields([
    { name: 'banners' },
    { name: 'products' }
]), createPage)

router.get(`/page/:category/:type`, getPage);

module.exports = router;