const express = require('express')
const { getCustomerOrder, createCustomerOrder } = require('../Controllers/customerOrder.controllers')
const router = express.Router()
const upload = require('../Utils/fileUpload')


router.get('/getCustomerInfo',getCustomerOrder)
router.post('/create', upload.array('images',10),createCustomerOrder);

module.exports = router