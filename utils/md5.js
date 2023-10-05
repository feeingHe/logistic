/**
 * 描述: 封装md5方法
 * 作者: feenyhe
 * 日期: 2023-9-20
*/

const crypto = require('crypto'); // 引入crypto加密模块

function md5(s) {
  return crypto.createHash('md5').update('' + s).digest('hex');
}

module.exports = md5;