/**
 * 描述: 业务逻辑处理 - 用户相关接口
 * 作者: feenyhe
 * 日期: 2023-10-02
*/


const { querySql, queryOne } = require('../utils/index');
const { validRequest, returnQuerySql } = require('./common');
const { checkRequiredField, getUuid } = require('../utils/util')
const {
  CODE_ERROR,
  CODE_SUCCESS,
} = require('../utils/constant');
const moment = require('moment');


// 通过任务名称或ID查询数据是否存在
function findData(id) {
  const query = `SELECT * FROM quotes_manage WHERE id='${id}' and status != 0`;
  return queryOne(query);
}
// SELECT * FROM logistic.quotes_manage WHERE id='b6rtlh7czwxgdpofa2q439';
/**
 *  fetch("http://logistic.com/api/addQuote",{
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
const returnSql = (fields = []) => {
  let sqlStart = `insert into quotes_manage(`;
  const sqlMainKeys = [];
  const sqlMainVals = [];
  const hasQuot = ['string'];
  fields.forEach(field => {
    const { key, val, type } = field;
    if (val !== undefined && val !== null) {
      sqlMainKeys.push(key)
      if (hasQuot.includes(type)) {
        sqlMainVals.push("'" + val + "'")
      } else {
        sqlMainVals.push(val)
      }
    }
  });
  return (sqlStart + sqlMainKeys.join(',') + `) VALUES(` + sqlMainVals.join(',') + `) ;`).replace(/\n/g, ' ');
}

// add Quote
function addQuote(req, res, next) {
  validRequest(req, res, next).then(({ username }) => {
    let { order_unique_id, selling_price, flight, saler, status = 1, remark, extend } = req.body;
    // check required fields
    const errorFields = checkRequiredField({ order_unique_id });
    if (errorFields && errorFields.length) {
      res.json({
        code: CODE_ERROR,
        msg: errorFields.join(',') + ' can not be empty',
        data: null
      })
      return;
    }
    if (![1, 2].includes(status)) {
      res.json({
        code: CODE_ERROR,
        msg: 'Status must be either 1 or 2',
        data: null
      })
      return;
    }
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    const insertDataId = getUuid(32);
    const fields = [
      { key: 'id', type: 'string', val: insertDataId},
      { key: 'unique_id', type: 'string', val: 'quote_' + getUuid(18) },
      { key: 'parent_id', type: 'string', val: -1 },
      { key: 'order_unique_id', type: 'string', val: order_unique_id },
      { key: 'selling_price', type: 'number', val: selling_price },
      { key: 'flight', type: 'string', val: flight },
      { key: 'saler', type: 'string', val: saler },
      { key: 'create_time', type: 'string', val: timestamp },
      { key: 'creator', type: 'string', val: username },
      { key: 'status', type: 'number', val: status },
      { key: 'remark', type: 'string', val: remark },
      { key: 'action_type', type: 'string', val: 'added' },
      { key: 'extend', type: 'string', val: extend }
    ];
    const addSql = returnSql(fields);
    console.log('...addQuote:', addSql);

    querySql(addSql)
      .then(data => {
        // console.log('添加任务===', data);
        if (!data || data.length === 0) {
          res.json({
            code: CODE_ERROR,
            msg: 'insert data error',
            data: null
          })
        } else {
          findData(insertDataId).then(result=>{
            res.json({
              code: CODE_SUCCESS,
              msg: 'insert data success',
              data: result
            })
          }).catch(err =>{
            res.json({
              code: CODE_ERROR,
              msg: 'insert data error: ' + err.message,
              data: null
            })
          })
          
        }
      }).catch(err => {
        res.json({
          code: CODE_ERROR,
          msg: 'error:' + err.message,
          data: null
        });
        console.log('--error:', err.message)
      })


  }).catch((err) => {
    console.log('add error:' + err.message)
  })
}

// delete Quote
function deleteQuote(req, res, next) {
  validRequest(req, res, next).then(({ username }) => {
    let { id } = req.body;
    // check required fields
    const errorFields = checkRequiredField({ id });
    if (errorFields && errorFields.length) {
      res.json({
        code: CODE_ERROR,
        msg: errorFields.join(',') + ' can not be empty',
        data: null
      })
      return;
    }
    findData(id).then(data => {
      if (!data || data.length === 0) {
        res.json({
          code: CODE_ERROR,
          msg: 'delete data error:can not find this data by id ' + id,
          data: null
        })
      } else {
        const deleteSql = `UPDATE quotes_manage SET status=101 WHERE id = '${id}';`;

        querySql(deleteSql)
          .then(queryData => {
            // console.log('删除任务===', data);
            if (!queryData || queryData.length === 0) {
              throw new Error('error when update previous data')
            } else {
              const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');

              const fields = [
                { key: 'id', type: 'string', val: getUuid(32) },
                { key: 'unique_id', type: 'string', val: data.unique_id },
                { key: 'parent_id', type: 'string', val: data.id },
                { key: 'order_unique_id', type: 'string', val: data.order_unique_id },
                { key: 'selling_price', type: 'number', val: data.selling_price },
                { key: 'flight', type: 'string', val: data.flight },
                { key: 'saler', type: 'string', val: data.saler },
                { key: 'create_time', type: 'string', val: timestamp },
                { key: 'creator', type: 'string', val: username },
                { key: 'status', type: 'number', val: 0 },
                { key: 'parent_status', type: 'number', val: data.status },
                { key: 'remark', type: 'string', val: data.remark },
                { key: 'action_type', type: 'string', val: 'deleted' },
                { key: 'extend', type: 'string', val: data.extend }
              ];
              const insertSql = returnSql(fields);
              console.log('...deleteQuote:', insertSql);

              querySql(insertSql).then(data => {
                if (!data || data.length === 0) {
                  throw new Error('');
                } else {
                  res.json({
                    code: CODE_SUCCESS,
                    msg: 'delete data success',
                    data: null
                  });
                }
              }).catch((err) => {
                res.json({
                  code: CODE_ERROR,
                  msg: 'delete data error',
                  data: null
                })
                console.log(err)
              })
            }
          })
          .catch(err => {
            res.json({
              code: CODE_ERROR,
              msg: 'error:' + err.message,
              data: null
            })
            console.log(err)
          })
      }
    }).catch((err) => {
      res.json({
        code: CODE_ERROR,
        msg: 'id is invalid!',
        data: null
      });
      console.log('delete error:', err.message)
    })
  }).catch((err) => {
    console.log('delete error:' + err.message)
  })
}

// modify Quote
function modifyQuote(req, res, next) {
  validRequest(req, res, next).then(({ username }) => {
    let { id, status = 1 } = req.body;
    // check required fields
    const errorFields = checkRequiredField({ id });
    if (errorFields && errorFields.length) {
      res.json({
        code: CODE_ERROR,
        msg: errorFields.join(',') + ' can not be empty',
        data: null
      })
      return;
    }
    if (![1, 2].includes(status)) {
      res.json({
        code: CODE_ERROR,
        msg: 'Status must be either 1 or 2',
        data: null
      })
      return;
    }
    findData(id).then(data => {
      if (!data || data.length === 0) {
        res.json({
          code: CODE_ERROR,
          msg: 'modify data error:can not find this data',
          data: null
        })
      } else {
        const deleteSql = `UPDATE quotes_manage SET status=102 WHERE unique_id = '${data.unique_id }';`;

        querySql(deleteSql).then((queryData) => {
          if (!queryData || queryData.length === 0) {
            throw new Error('error when update previous data by id ' + id)
          } else {
            const assginedData = Object.assign({}, data, req.body, { unique_id: data.unique_id });
            const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
            const fields = [
              { key: 'id', type: 'string', val: getUuid(32) },
              { key: 'unique_id', type: 'string', val: assginedData.unique_id },
              { key: 'parent_id', type: 'string', val: data.id },
              { key: 'order_unique_id', type: 'string', val: assginedData.order_unique_id },
              { key: 'selling_price', type: 'number', val: assginedData.selling_price },
              { key: 'flight', type: 'string', val: assginedData.flight },
              { key: 'saler', type: 'string', val: assginedData.saler },
              { key: 'create_time', type: 'string', val: timestamp },
              { key: 'creator', type: 'string', val: username },
              { key: 'status', type: 'number', val: assginedData.status },
              { key: 'parent_status', type: 'number', val: data.status },
              { key: 'remark', type: 'string', val: assginedData.remark },
              { key: 'action_type', type: 'string', val: 'modified' },
              { key: 'extend', type: 'string', val: assginedData.extend }
            ];
            const insertSql = returnSql(fields);
            console.log('---modifyQuote insert sql:', insertSql);
            querySql(insertSql)
              .then(insertData => {
                // console.log('删除任务===', data);
                if (!insertData || insertData.length === 0) {
                  throw new Error('error when update previous data')
                } else {
                  res.json({
                    code: CODE_SUCCESS,
                    msg: 'modify data success',
                    data: null
                  })
                }
              })
              .catch(err => {
                res.json({
                  code: CODE_ERROR,
                  msg: 'error:' + err.message,
                  data: null
                })
                console.log(err)
              })
          }
        }).catch(err => {
          res.json({
            code: CODE_ERROR,
            msg: 'error:' + err.message,
            data: null
          })
          console.log(err)
        })

      }
    }).catch(() => {
      res.json({
        code: CODE_ERROR,
        msg: 'id is invalid!',
        data: null
      })
    })
  }).catch((err) => {
    console.log('modify error:' + err.message)
  })
}

// Quote query
function queryQuote(req, res, next) {
  validRequest(req, res, next).then(() => {
    let { id, unique_id, parent_id, order_unique_id, selling_price, flight, saler, creator, status, page_num = 1, page_size = 10 } = req.body;
    const fields = [
      { key: 'id', type: 'string', val: id },
      { key: 'unique_id', type: 'string', val: unique_id },
      { key: 'parent_id', type: 'string', val: parent_id },
      { key: 'order_unique_id', type: 'string', val: order_unique_id },
      { key: 'selling_price', type: 'number', val: selling_price },
      { key: 'flight', type: 'string', val: flight },
      { key: 'saler', type: 'string', val: saler },
      { key: 'creator', type: 'string', val: creator },
      { key: 'status', type: 'array', val: status !== undefined ? status : [1,2] }
    ];

    const sql = returnQuerySql('quotes_manage',fields, page_num, page_size);

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
  addQuote,
  deleteQuote,
  modifyQuote,
  queryQuote
}
