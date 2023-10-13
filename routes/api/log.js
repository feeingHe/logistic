/**
 * 描述: 任务路由模块
 * 作者: feenyhe
 * 日期: 2023-9-22
*/

const express = require('express');
const router = express.Router();
const service = require('../../services/loggerService');


// log接口
router.post('/getLog', service.queryLog);


module.exports = router;

