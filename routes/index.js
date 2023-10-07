/**
 * 描述: 初始化路由信息，自定义全局异常处理
 * 作者: feenyhe
 * 日期: 2023-9-20
*/

const express = require('express');
// const boom = require('boom'); // 引入boom模块，处理程序异常状态
const commonRouter = require('./api/common'); // 引入user路由模块
const userRouter = require('./api/users'); // 引入user路由模块
const menuRouter = require('./api/menu'); // 引入user路由模块
const enquiryRouter = require('./api/enquiry'); // 引入task路由模块
const quoteRouter = require('./api/quote'); // 引入task路由模块
const { jwtAuth } = require('../utils/user-jwt'); // 引入jwt认证函数
const router = express.Router(); // 注册路由 

router.use(jwtAuth); // 注入认证模块

router.use('/api', commonRouter); // common路由模块
router.use('/api', userRouter); // 注入用户路由模块
router.use('/api', menuRouter); // 菜单路由模块
router.use('/api', enquiryRouter); // enquiry路由模块
router.use('/api', quoteRouter); // quote路由模块

// 自定义统一异常处理中间件，需要放在代码最后
// !!!next 不能删除！！！！
router.use((err, req, res, next) => {//err, req, res,/* next*/
  // 自定义用户认证失败的错误返回 
  // console.log('%s %s %s', req.method, req.url, req.path);
  console.log('err===', next);
  if (err && err.name === 'UnauthorizedError') {
    const { status = 401, message } = err;

    // 抛出401异常
    res.status(status).json({
      code: status,
      msg: 'token is invalid ,please login in again',
      data: message
    })
  } else {
    const { output } = err || {};
    // 错误码和错误信息
    const errCode = (output && output.statusCode) || 500;
    const errMsg = (output && output.payload && output.payload.error) || err.message;
    res.status(errCode).json({
      code: errCode,
      msg: errMsg
    })
  }
})

module.exports = router;