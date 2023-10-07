/**
 * 描述: 任务路由模块
 * 作者: feenyhe
 * 日期: 2023-9-22
*/

const express = require('express');
const router = express.Router();
const service = require('../../services/enquiryService');

// api
router.post('/addOrder', service.addEnquiry);
router.post('/deleteOrder', service.deleteEnquiry);
router.post('/modifyOrder', service.modifyEnquiry);
router.post('/queryOrder', service.queryEnquiry);


module.exports = router;

