/**
 * 描述: 任务路由模块
 * 作者: feenyhe
 * 日期: 2023-9-22
*/

const express = require('express');
const router = express.Router();
const service = require('../../services/baseService');


// base接口
router.post('/customerQuery', service.customerQuery);
router.post('/countryQuery', service.countryQuery);
router.post('/destinationQuery', service.destinationQuery);


module.exports = router;

