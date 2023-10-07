/**
 * 描述: 任务路由模块
 * 作者: feenyhe
 * 日期: 2023-10-02
*/

const express = require('express');
const router = express.Router();
const service = require('../../services/consoleService');

// api
router.post('/addConsole', service.addConsole);
router.post('/deleteConsole', service.deleteConsole);
router.post('/modifyConsole', service.modifyConsole);
router.post('/queryConsole', service.queryConsole);


module.exports = router;

