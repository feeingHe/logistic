/**
 * 描述: 业务逻辑处理 - 用户相关接口
 * 作者: feenyhe
 * 日期: 2023-9-20
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
  const query = `SELECT * FROM booking_manage WHERE id='${id}' and status != 0`;
  return queryOne(query);
}
// SELECT * FROM logistic.booking_manage WHERE id='b6rtlh7czwxgdpofa2q439';
/**
 *  fetch("http://127.0.0.1:9188/api/addEnquiry",{
    method:'post',
     body:JSON.stringify({
        dest:'LAX',
        customer:'feeny',
         saler:'salererer',
         ready_date:'2023-10-1 15:00:00',
         transit_time_require:1.5,
         mawb:'1.1',
         flight:'BeiJing To LAX',
         special_remark:'noting',
         selling_price:31.52,
         require_pickup:0,
         quantity_estimate:35,
         gross_weight_estimate:22.6,
         cmb_estimate:1.1,
         vol_estimate:167.167,
         dim_estimate:'asa',
         extend:'extend info...'

     }),
    headers:{
         "Content-Type": "application/json",                
         "Authorization":'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IjExMSIsInBlcm1pc3Npb24iOjEwLCJpYXQiOjE2OTY1OTYzMTIsImV4cCI6MTY5NjU5OTkxMn0.6kQhTMkr_z61XLTVUIpVI2cBFcu2nqECxLuDRk5gvPU',
        "X-requestId":"asdasd123",
    },
})
 */
const returnSql = (fields = []) => {
  let sqlStart = `insert into booking_manage(`;
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

// add Enquiry
function addEnquiry(req, res, next) {
  validRequest(req, res, next).then(({ username }) => {
    let { dest, customer, saler, ready_date, transit_time_require, status = 1, mawb, flight, special_remark, selling_price, selling_price_text, require_pickup, quantity_estimate, gross_weight_estimate, cmb_estimate, vol_estimate, dim_estimate, quantity_actual, gross_weight_actual, cmb_actual, vol_actual, dim_actual, is_create_confirmed = 0, extend } = req.body;
    // check required fields
    const errorFields = checkRequiredField({ dest, customer, ready_date, transit_time_require });
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
    const dateDay = timestamp.split(' ')[0].replace(/-/g, '');
    // delete from booking_manage WHERE unique_id LIKE '%20231007%';
    const queryUniqueIdSql = `SELECT * from booking_manage WHERE unique_id LIKE '%${dateDay}%';`;
    querySql(queryUniqueIdSql).then((todayDataList = []) => {
      const uniqueIdStack = todayDataList.map(list => list.unique_id).sort();
      // unique_id no
      const no = +(uniqueIdStack.slice(-1)[0] || (dateDay + "0000")) + 1;
      uniqueIdStack.push(no);
      const fields = [
        { key: 'id', type: 'string', val: getUuid(32) },
        { key: 'unique_id', type: 'string', val: no },
        { key: 'parent_id', type: 'string', val: -1 },
        { key: 'dest', type: 'string', val: dest },
        { key: 'saler', type: 'string', val: saler },
        { key: 'customer', type: 'string', val: customer },
        { key: 'create_time', type: 'string', val: timestamp },
        { key: 'creator', type: 'string', val: username },
        { key: 'status', type: 'number', val: status },
        { key: 'ready_date', type: 'string', val: moment(ready_date).format('YYYY-MM-DD HH:mm:ss') },
        { key: 'transit_time_require', type: 'string', val: transit_time_require },

        // estimate
        { key: 'quantity_estimate', type: 'number', val: quantity_estimate },
        { key: 'gross_weight_estimate', type: 'number', val: gross_weight_estimate },
        { key: 'cmb_estimate', type: 'number', val: cmb_estimate },
        { key: 'vol_estimate', type: 'number', val: vol_estimate },
        { key: 'dim_estimate', type: 'string', val: dim_estimate },
        // actual
        { key: 'quantity_actual', type: 'number', val: quantity_actual },
        { key: 'gross_weight_actual', type: 'number', val: gross_weight_actual },
        { key: 'cmb_actual', type: 'number', val: cmb_actual },
        { key: 'vol_actual', type: 'number', val: vol_actual },
        { key: 'dim_actual', type: 'string', val: dim_actual },

        { key: 'mawb', type: 'string', val: mawb },
        { key: 'flight', type: 'string', val: flight },
        { key: 'special_remark', type: 'string', val: special_remark },
        { key: 'selling_price', type: 'number', val: selling_price },
        { key: 'selling_price_text', type: 'string', val: selling_price_text },
        { key: 'require_pickup', type: 'number', val: require_pickup },
        { key: 'action_type', type: 'string', val: 'added' },
        { key: 'is_create_confirmed', type: 'number', val: is_create_confirmed },
        { key: 'extend', type: 'string', val: extend }
      ];
      const addSql = returnSql(fields);
      console.log('...addEnquiry:', addSql);

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
      console.log('--queryUniqueIdSql err:', err)
    })

  }).catch((err) => {
    console.log('add error:' + err.message)
  })
}

// delete Enquiry
function deleteEnquiry(req, res, next) {
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
    console.log('--start delete!!!', username)
    findData(id).then(data => {
      if (!data || data.length === 0) {
        res.json({
          code: CODE_ERROR,
          msg: 'delete data error:can not find this data by id ' + id,
          data: null
        })
      } else {
        const deleteSql = `UPDATE booking_manage SET status=101 WHERE id = '${id}';`;

        querySql(deleteSql)
          .then(queryData => {
            // console.log('删除任务===', data);
            if (!queryData || queryData.length === 0) {
              throw new Error('error when update previous data')
            } else {
              const fields = [
                { key: 'id', type: 'string', val: getUuid(32) },
                { key: 'unique_id', type: 'string', val: data.unique_id },
                { key: 'parent_id', type: 'string', val: data.id },
                { key: 'dest', type: 'string', val: data.dest },
                { key: 'saler', type: 'string', val: data.saler },
                { key: 'customer', type: 'string', val: data.customer },
                { key: 'create_time', type: 'string', val: moment().format('YYYY-MM-DD HH:mm:ss') },
                { key: 'creator', type: 'string', val: username },
                { key: 'status', type: 'number', val: 0 },
                { key: 'parent_status', type: 'number', val: data.status },
                { key: 'ready_date', type: 'string', val: moment(data.ready_date).format('YYYY-MM-DD HH:mm:ss') },
                { key: 'transit_time_require', type: 'string', val: data.transit_time_require },

                // estimate
                { key: 'quantity_estimate', type: 'number', val: data.quantity_estimate },
                { key: 'gross_weight_estimate', type: 'number', val: data.gross_weight_estimate },
                { key: 'cmb_estimate', type: 'number', val: data.cmb_estimate },
                { key: 'vol_estimate', type: 'number', val: data.vol_estimate },
                { key: 'dim_estimate', type: 'string', val: data.dim_estimate },
                // actual
                { key: 'quantity_actual', type: 'number', val: data.quantity_actual },
                { key: 'gross_weight_actual', type: 'number', val: data.gross_weight_actual },
                { key: 'cmb_actual', type: 'number', val: data.cmb_actual },
                { key: 'vol_actual', type: 'number', val: data.vol_actual },
                { key: 'dim_actual', type: 'string', val: data.dim_actual },

                { key: 'mawb', type: 'string', val: data.mawb },
                { key: 'flight', type: 'string', val: data.flight },
                { key: 'special_remark', type: 'string', val: data.special_remark },
                { key: 'selling_price', type: 'number', val: data.selling_price },
                { key: 'selling_price_text', type: 'string', val: data.selling_price_text },
                { key: 'require_pickup', type: 'number', val: data.require_pickup },
                { key: 'console_id', type: 'string', val: data.console_id },
                { key: 'action_type', type: 'string', val: 'deleted' },
                { key: 'is_create_confirmed', type: 'number', val: data.is_create_confirmed },
                { key: 'extend', type: 'string', val: data.extend }
              ];
              const insertSql = returnSql(fields);
              console.log('...deleteEnquiry:', insertSql);

              querySql(insertSql).then(data => {
                if (!data || data.length === 0) {
                  throw new Error('delete error');
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

// modify Enquiry
function modifyEnquiry(req, res, next) {
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
    if (![1, 2, 3].includes(status)) {
      res.json({
        code: CODE_ERROR,
        msg: 'Status must be either 1 or 2 or 3',
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
        const deleteSql = `UPDATE booking_manage SET status=102 WHERE id = '${id}';`;

        querySql(deleteSql).then((queryData) => {
          if (!queryData || queryData.length === 0) {
            throw new Error('error when update previous data by id ' + id)
          } else {
            const assginedData = Object.assign({}, data, req.body, { unique_id: data.unique_id });

            const fields = [
              { key: 'id', type: 'string', val: getUuid(32) },
              { key: 'unique_id', type: 'string', val: assginedData.unique_id },
              { key: 'parent_id', type: 'string', val: data.id },
              { key: 'dest', type: 'string', val: assginedData.dest },
              { key: 'saler', type: 'string', val: assginedData.saler },
              { key: 'customer', type: 'string', val: assginedData.customer },
              { key: 'create_time', type: 'string', val: moment().format('YYYY-MM-DD HH:mm:ss') },
              { key: 'creator', type: 'string', val: username || 'feeny' },
              { key: 'status', type: 'number', val: assginedData.status },
              { key: 'parent_status', type: 'number', val: data.status },
              { key: 'ready_date', type: 'string', val: moment(assginedData.ready_date).format('YYYY-MM-DD HH:mm:ss') },
              { key: 'transit_time_require', type: 'string', val: assginedData.transit_time_require },

              // estimate
              { key: 'quantity_estimate', type: 'number', val: assginedData.quantity_estimate },
              { key: 'gross_weight_estimate', type: 'number', val: assginedData.gross_weight_estimate },
              { key: 'cmb_estimate', type: 'number', val: assginedData.cmb_estimate },
              { key: 'vol_estimate', type: 'number', val: assginedData.vol_estimate },
              { key: 'dim_estimate', type: 'string', val: assginedData.dim_estimate },
              // actual
              { key: 'quantity_actual', type: 'number', val: assginedData.quantity_actual },
              { key: 'gross_weight_actual', type: 'number', val: assginedData.gross_weight_actual },
              { key: 'cmb_actual', type: 'number', val: assginedData.cmb_actual },
              { key: 'vol_actual', type: 'number', val: assginedData.vol_actual },
              { key: 'dim_actual', type: 'string', val: assginedData.dim_actual },

              { key: 'mawb', type: 'string', val: assginedData.mawb },
              { key: 'flight', type: 'string', val: assginedData.flight },
              { key: 'special_remark', type: 'string', val: assginedData.special_remark },
              { key: 'selling_price', type: 'number', val: assginedData.selling_price },
              { key: 'selling_price_text', type: 'string', val: assginedData.selling_price_text },
              { key: 'require_pickup', type: 'number', val: assginedData.require_pickup },
              { key: 'console_id', type: 'string', val: assginedData.console_id },
              { key: 'action_type', type: 'string', val: 'modified' },
              { key: 'is_create_confirmed', type: 'number', val: assginedData.is_create_confirmed },
              { key: 'extend', type: 'string', val: assginedData.extend }
            ];
            const insertSql = returnSql(fields);
            console.log('---modifyEnquiry insert sql:', insertSql);
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

// Enquiry query
// queryParams : {fields:[];callback:()=>any;page_num:number;page_size:number;}
function queryEnquiry(req, res, next, queryParams = {}) {
  (queryParams.isResolve ? Promise.resolve() : validRequest(req, res, next)).then(() => {
    const defaultStatus = [1, 2, 3];
    let fields = [], pageNum = 1, pageSize = 10, orderStatus = defaultStatus;
    if (queryParams.fields) {
      fields = queryParams.fields;
      pageNum = queryParams.page_number;
      pageSize = queryParams.page_size;
      orderStatus = (fields.find(f => f.key === 'status' && f.type === 'array') || {}).val || defaultStatus;
    } else {

      let { id, unique_id, parent_id, status, saler, customer, dest, flight, transit_time_require, is_create_confirmed, console_id, sort_key_list = ['unique_id'], page_num = 1, page_size = 10 } = req.body;
      orderStatus = status !== undefined ? status : defaultStatus;
      fields = [
        { key: 'id', type: 'string', val: id, isLike: true },
        { key: 'unique_id', type: 'string', val: unique_id, isLike: true },
        { key: 'parent_id', type: 'string', val: parent_id },

        { key: 'status', type: 'array', val: orderStatus },
        { key: 'saler', type: 'string', val: saler, isLike: true },
        { key: 'customer', type: 'string', val: customer, isLike: true },
        { key: 'dest', type: 'string', val: dest, isLike: true },
        { key: 'flight', type: 'string', val: flight, isLike: true },
        { key: 'transit_time_require', type: 'number', val: transit_time_require },
        { key: 'is_create_confirmed', type: 'number', val: is_create_confirmed },
        { key: 'console_id', type: 'array', val: console_id },
      ];
      pageNum = page_num;
      pageSize = page_size;
      if (sort_key_list instanceof Array) {
        sort_key_list.forEach(key => {
          fields.push({
            key,
            type: 'sortIndex'
          })
        })
      }
    }

    const sql = returnQuerySql('booking_manage', fields, pageNum, pageSize);

    querySql(sql)
      .then((data) => {
        // console.log('删除任务===', data);
        if (data && data.length) {

          const orderUniqueIds = data.map(d => d.unique_id).filter(Boolean) || [];
          if (orderUniqueIds.length) {
            const queryQuotesSql = `SELECT * from quotes_manage WHERE order_unique_id in (${orderUniqueIds.map(id => {
              if (typeof id === 'string') return `"${id}"`;
              return id;
            }).join(',')}) AND status NOT IN (0,101,102);`;
            querySql(queryQuotesSql).then((quotesList) => {
              const totalSql = `SELECT COUNT(*) FROM booking_manage WHERE status IN (${orderStatus.join(',')});`;

              querySql(totalSql).then(total => {
                const result = {
                  total: +total[0]['COUNT(*)'],
                  list: data.map(d => {
                    const { unique_id } = d;
                    const underQuotes = quotesList.filter(list => list.order_unique_id === unique_id);
                    return Object.assign({}, d, { quotes: underQuotes || [] })
                  })
                }
                // queryParams.callback
                if (typeof queryParams.callback === 'function') {
                  queryParams.callback(result.list);
                  // next();
                  return;
                }
                res.json({
                  code: CODE_SUCCESS,
                  msg: 'query data success',
                  data: result
                })
              }).catch(err => {
                res.json({
                  code: CODE_ERROR,
                  msg: 'error when query total:' + err.message,
                  data: null
                })
                console.log(err)
              })

            }).catch(err => {
              res.json({
                code: CODE_ERROR,
                msg: 'error when query sub quotes:' + err.message,
                data: null
              })
              console.log(err)
            })
          } else {
            if (typeof queryParams.callback === 'function') {
              queryParams.callback(data);
              // next();
              return;
            }
            res.json({
              code: CODE_SUCCESS,
              msg: 'query data success',
              data
            })
          }

        } else {
          if (typeof queryParams.callback === 'function') {
            queryParams.callback([]);
            // next();
            return;
          }
          res.json({
            code: CODE_SUCCESS,
            msg: 'query data success',
            data: []
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
  }).catch((err) => {
    console.log('query orders error:' + err.message)
  })
}



module.exports = {
  addEnquiry,
  deleteEnquiry,
  modifyEnquiry,
  queryEnquiry
}
