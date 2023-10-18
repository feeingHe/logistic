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
const { queryEnquiry } = require('./enquiryService')

// 通过任务名称或ID查询数据是否存在
function findData(id) {
  const query = `SELECT * FROM console_manage WHERE id='${id}' and status != 0`;
  return queryOne(query);
}
// SELECT * FROM logistic.console_manage WHERE id='b6rtlh7czwxgdpofa2q439';
/**
 *  fetch("http://127.0.0.1:9188/api/addConsole",{
    method:'post',
     body:JSON.stringify({
      "name":'xxxx con',
      "flight":'xxxx fli',
      "dest":'xxxx des',
      "extend":"xxxx ..ex",   
     }),
    headers:{
         "Content-Type": "application/json",                
         "Authorization":'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IjExMSIsInBlcm1pc3Npb24iOjEwLCJpYXQiOjE2OTY2Njk2NDEsImV4cCI6MTY5Njc1NjA0MX0.z4pvwUBeiVE8lF_emMpYWXSGlvIAPKq1i1mEF0uxd2o',
        "X-requestId":"asdasd123",
    },
})
 */
const returnSql = (fields = []) => {
  let sqlStart = `insert into console_manage(`;
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

// add Console
function addConsole(req, res, next) {
  validRequest(req, res, next).then(({ username }) => {
    let { name, flight, airline, dest, status = 1, extend } = req.body;
    // check required fields
    const errorFields = checkRequiredField({ name, flight, dest });
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
    const date = timestamp.split(' ')[0].replace(/-/g, '');

    const queryUniqueIdSql = `SELECT * from console_manage WHERE unique_id LIKE '%CFS${date}%';`;
    querySql(queryUniqueIdSql).then((todayDataList = []) => {
      const uniqueIdStack = todayDataList.map(list => list.unique_id.replace(/-|CFS/g, '')).sort();
      // unique_id no
      const no = ("CFS" + date + '-' + ('000' + (+uniqueIdStack.slice(-1).slice(-3) + 1)).slice(-3) || ('CFS' + date + '-' + + "001"));
      uniqueIdStack.push(no);

      const fields = [
        { key: 'id', type: 'string', val: getUuid(32) },
        { key: 'unique_id', type: 'string', val: no },
        { key: 'parent_id', type: 'string', val: -1 },
        { key: 'name', type: 'string', val: name },
        { key: 'flight', type: 'string', val: flight },
        { key: 'airline', type: 'string', val: airline },
        { key: 'dest', type: 'string', val: dest },
        { key: 'create_time', type: 'string', val: timestamp },
        { key: 'creator', type: 'string', val: username },
        { key: 'status', type: 'number', val: status },
        { key: 'action_type', type: 'string', val: 'added' },
        { key: 'extend', type: 'string', val: extend }
      ];
      const addSql = returnSql(fields);
      console.log('...addConsole:', addSql);

      querySql(addSql)
        .then(data => {
          if (!data || data.length === 0) {
            res.json({
              code: CODE_ERROR,
              msg: 'insert data error',
              data: null
            })
          } else {
            res.json({
              code: CODE_SUCCESS,
              msg: 'insert data success',
              data: null
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


    }).catch(err => {
      res.json({
        code: CODE_ERROR,
        msg: 'add console error:' + err.message,
        data: null
      });
    })


  }).catch((err) => {
    res.json({
      code: CODE_ERROR,
      msg: 'error:' + err.message,
      data: null
    });
    console.log('add console error:' + err.message)
  })
}

// delete Console
function deleteConsole(req, res, next) {
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
        const deleteSql = `UPDATE console_manage SET status=101 WHERE id = '${id}';`;

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
                { key: 'name', type: 'string', val: data.name },
                { key: 'flight', type: 'string', val: data.flight },
                { key: 'airline', type: 'string', val: data.airline },
                { key: 'dest', type: 'string', val: data.dest },
                { key: 'create_time', type: 'string', val: timestamp },
                { key: 'creator', type: 'string', val: username },
                { key: 'status', type: 'number', val: 0 },
                { key: 'parent_status', type: 'number', val: data.status },
                { key: 'action_type', type: 'string', val: 'deleted' },
                { key: 'extend', type: 'string', val: data.extend }
              ];
              const insertSql = returnSql(fields);
              console.log('...deleteConsole:', insertSql);

              querySql(insertSql).then(inserteDdata => {
                if (!inserteDdata || inserteDdata.length === 0) {
                  throw new Error('delete error');
                } else {
                  const updateBookingSql = `UPDATE booking_manage SET status = 2 WHERE console_id = '${data.unique_id}' AND status = 3`;
                  querySql(updateBookingSql).then(() => {
                    res.json({
                      code: CODE_SUCCESS,
                      msg: 'delete data success',
                      data: null
                    });
                  }).catch(err => {
                    res.json({
                      code: CODE_ERROR,
                      msg: 'delete data error when update booking status:' + err.message,
                      data: null
                    })
                    console.log(err)
                  })

                }
              }).catch((err) => {
                res.json({
                  code: CODE_ERROR,
                  msg: 'delete data error',
                  data: null
                })
                console.log('delete data error', err)
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

// modify Console
function modifyConsole(req, res, next) {
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
        if ([101, 102].includes(data.status)) {
          res.json({
            code: CODE_ERROR,
            msg: 'The data has been modified by someone else. Please refresh to get the latest status',
            data: null
          })
          return;
        }
        const deleteSql = `UPDATE console_manage SET status=102 WHERE id = '${id}';`;

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
              { key: 'name', type: 'string', val: assginedData.name },
              { key: 'flight', type: 'string', val: assginedData.flight },
              { key: 'airline', type: 'string', val: assginedData.airline },

              { key: 'dest', type: 'string', val: assginedData.dest },
              { key: 'create_time', type: 'string', val: timestamp },
              { key: 'creator', type: 'string', val: username },
              { key: 'status', type: 'number', val: assginedData.status },
              { key: 'parent_status', type: 'number', val: data.status },
              { key: 'action_type', type: 'string', val: 'modified' },
              { key: 'extend', type: 'string', val: assginedData.extend }
            ];
            const insertSql = returnSql(fields);
            console.log('---modifyConsole insert sql:', insertSql);
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
// Console query
function queryConsole(req, res, next) {
  validRequest(req, res, next).then(() => {
    let { id, unique_id, parent_id, status, flight, airline, dest, name, creator, sort_key_list = ['create_time'], orders_limit = 10000, page_num = 1, page_size = 10 } = req.body;
    const fields = [
      { key: 'id', type: 'string', val: id, isLike: true },
      { key: 'unique_id', type: 'string', val: unique_id, isLike: true },
      { key: 'parent_id', type: 'string', val: parent_id },
      { key: 'status', type: 'array', val: status !== undefined ? status : [1, 2] },
      { key: 'name', type: 'string', val: name, isLike: true },
      { key: 'flight', type: 'string', val: flight, isLike: true },
      { key: 'airline', type: 'string', val: airline, isLike: true },
      { key: 'dest', type: 'string', val: dest, isLike: true },
      { key: 'creator', type: 'string', val: creator, isLike: true },
    ];
    if (sort_key_list instanceof Array) {
      sort_key_list.forEach(key => {
        fields.push({
          key,
          type: 'sortIndex'
        })
      })
    }
    const sql = returnQuerySql('console_manage', fields, page_num, page_size);

    querySql(sql)
      .then(data => {
        // console.log('删除任务===', data);
        // -----查询关联表-------
        const consoleUniqueIds = data.map(d => d.unique_id).filter(Boolean) || [];
        if (consoleUniqueIds.length) {
          // console.log('--req',req)
          // to Query Orders
          queryEnquiry(null, res, null, {
            isResolve: true,
            fields: [
              { key: 'console_id', type: 'array', val: consoleUniqueIds },
              { key: 'status', type: 'array', val: [3] },
            ],
            pageNum: 1,
            pageSize: orders_limit,
            callback(ordersList) {
              const totalSql = `SELECT COUNT(*) FROM console_manage WHERE status IN (${status !== undefined ? status.join(',') : '1, 2'});`;
              querySql(totalSql).then(total => {
                res.json({
                  code: CODE_SUCCESS,
                  msg: 'query data success',
                  data: {
                    total: +total[0]['COUNT(*)'],
                    list: data.map(d => {
                      const { unique_id } = d;
                      const underConsoles = (ordersList || []).filter(order => order.console_id === unique_id);
                      return Object.assign({}, d, { orders: underConsoles || [] })
                    })
                  }
                })
              }).catch((err) => {
                res.json({
                  code: CODE_ERROR,
                  msg: 'error when query consoles total:' + err.message,
                  data: null
                })
              })
            }
          })

        } else {
          res.json({
            code: CODE_SUCCESS,
            msg: 'query data success',
            data
          })
        }
        // ------- end ------
      })
      .catch(err => {
        res.json({
          code: CODE_ERROR,
          msg: 'error:' + err.message,
          data: null
        })
        console.log('--query console error:', err)
      })
  }).catch((err) => {
    console.log('query error:' + err.message)
  })
}



module.exports = {
  addConsole,
  deleteConsole,
  modifyConsole,
  queryConsole
}
