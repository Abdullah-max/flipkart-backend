const express = require('express');
const { updateOrder, getCustomerOrders } = require('../../controllers/admin/order.admin');
const { requireSignin, adminMiddleware } = require('../../middleware');
const router = express.Router();

router.post(`/order/update`, requireSignin, adminMiddleware, updateOrder);
router.post(`/order/getCustomerOrders`, requireSignin, adminMiddleware, getCustomerOrders);
module.exports = router;