/**
 * 描述: 任务路由模块
 * 作者: feenyhe
 * 日期: 2023-10-02
*/

const express = require('express');
const router = express.Router();
const service = require('../../services/quoteService');

// api
router.post('/addQuote', service.addQuote);
router.post('/deleteQuote', service.deleteQuote);
router.post('/modifyQuote', service.modifyQuote);


module.exports = router;

