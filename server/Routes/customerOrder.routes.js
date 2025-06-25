const express = require('express')
const { getCustomerOrder, createCustomerOrder, updateCustomerOrder, deleteCustomerOrder } = require('../Controllers/customerOrder.controllers')
const router = express.Router()
const upload = require('../Utils/fileUpload')


router.get('/getCustomerInfo/:customer_id',getCustomerOrder)
router.post('/create', upload.any(),createCustomerOrder);
router.put('/update/:orderId',upload.any(),updateCustomerOrder)
router.delete('/delete/:orderId',deleteCustomerOrder)

module.exports = router