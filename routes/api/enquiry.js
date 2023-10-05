/**
 * 描述: 任务路由模块
 * 作者: feenyhe
 * 日期: 2023-9-22
*/

const express = require('express');
const router = express.Router();
const service = require('../../services/enquiryService');

// api
router.post('/addEnquiry', service.addEnquiry);
router.post('/deleteEnquiry', service.deleteEnquiry);
router.post('/modifyEnquiry', service.modifyEnquiry);
router.post('/queryEnquiry', service.queryEnquiry);


module.exports = router;

