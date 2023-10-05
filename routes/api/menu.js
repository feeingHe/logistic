/**
 * 描述: 任务路由模块
 * 作者: feenyhe
 * 日期: 2023-9-22
*/

const express = require('express');
const router = express.Router();
const service = require('../../services/menuService');


// 任务清单接口
router.post('/getMenuList', service.menuListQuery);


module.exports = router;

