/**
 * 描述: 业务逻辑处理 - 用户相关接口
 * 作者: feenyhe
 * 日期: 2023-10-02
*/


const { querySql } = require('../utils/index');
const { validRequest, returnQuerySql } = require('./common');
const { checkRequiredField } = require('../utils/util')
const {
  CODE_ERROR,
  CODE_SUCCESS,
} = require('../utils/constant');

// SELECT * FROM logistic.quotes_manage WHERE id='b6rtlh7czwxgdpofa2q439';
/**
 *  fetch("http://127.0.0.1:9188/api/addQuote",{
    method:'post',
     body:JSON.stringify({
    "order_unique_id":'xaxsa',
    "saler":"fffsssaallleerr",
    "selling_price":33.33,
    "flight"?:'sssssflight',
    "remark"?:'xxxx remark ',
    "extend"?:"xxxx extend", 

     }),
    headers:{
         "Content-Type": "application/json",                
         "Authorization":'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IjExMSIsInBlcm1pc3Npb24iOjEwLCJpYXQiOjE2OTY2Njk2NDEsImV4cCI6MTY5Njc1NjA0MX0.z4pvwUBeiVE8lF_emMpYWXSGlvIAPKq1i1mEF0uxd2o',
        "X-requestId":"asdasd123",
    },
})
 */

// log query
function queryLog(req, res, next) {
  validRequest(req, res, next).then(({ username }) => {
    let { type, unique_id, creator = username, page_num = 1, page_size = 10 } = req.body;
    const errorFields = checkRequiredField({ type });
    if (errorFields && errorFields.length) {
      res.json({
        code: CODE_ERROR,
        msg: errorFields.join(',') + ' can not be empty',
        data: null
      })
      return;
    }
    const fields = [
      { key: 'unique_id', type: 'string', val: unique_id, isLike: true },
      { key: 'creator', type: 'string', val: creator },
    ];

    const dbMap = {
      console: 'console_manage',
      order: 'booking_manage',
      quote: 'quotes_manage',
    }
    const dbName = dbMap[type];
    if (!dbName) {
      res.json({
        code: CODE_ERROR,
        msg: `type: '${type}' must in console、booking、quote`,
        data: null
      })
    }
    const sql = returnQuerySql(dbName, fields, page_num, page_size);

    querySql(sql)
      .then(data => {
        // console.log('删除任务===', data);
        res.json({
          code: CODE_SUCCESS,
          msg: 'query data success',
          data: data
        })
      })
      .catch(err => {
        res.json({
          code: CODE_ERROR,
          msg: 'error:' + err.message,
          data: null
        })
        console.log(err)
      })
  }).catch((err) => {
    console.log('query error:' + err.message)
  })
}



module.exports = {
  queryLog
}
