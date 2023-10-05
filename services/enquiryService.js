/**
 * 描述: 业务逻辑处理 - 用户相关接口
 * 作者: feenyhe
 * 日期: 2023-9-20
*/


const { querySql, queryOne } = require('../utils/index');
const { validRequest } = require('./common');
const { checkRequiredField, getUuid } = require('../utils/util')
const {
  CODE_ERROR,
  CODE_SUCCESS,
} = require('../utils/constant');

// 通过任务名称或ID查询数据是否存在
function findData(id) {
  const query = `SELECT * FROM booking_manage WHERE id='${id}'`;
  return queryOne(query);
}

// add Enquiry
function addEnquiry(req, res, next) {
  validRequest(req, next).then(({ username }) => {
    let { dest, customer, ready_date, transit_time_require, mawb, flight, special_remark, selling, require_pickup, quantity_estimate, gross_weight_estimate, cmb_estimate, vol_estimate, dim_estimate, extend } = req.body;
    // check required fields
    const errorFields = checkRequiredField({ dest, customer, ready_date, transit_time_require });
    if (errorFields && errorFields.length) {
      res.json({
        code: CODE_ERROR,
        msg: errorFields.join(',') + ' can not be empty',
        data: null
      })
    }

    const query = `insert into booking_manage(id,unique_id,parent_id,dest, customer, ready_date, transit_time_require, mawb,flight,special_remark,selling,require_pickup,quantity_estimate,gross_weight_estimate,cmb_estimate,vol_estimate,dim_estimate,creater,create_time,action_type,extend)
     values(` + [getUuid(32), getUuid(32), "-1", dest, customer, ready_date, transit_time_require, mawb, flight, special_remark, selling, require_pickup, quantity_estimate, gross_weight_estimate, cmb_estimate, vol_estimate, dim_estimate, username, Date.now(), 'added', extend].join(',') + `)`;
    querySql(query)
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
        })
      })
  })
}

// delete Enquiry
function deleteEnquiry(req, res, next) {
  validRequest(req, next).then(({ username }) => {
    let { id } = req.body;
    // check required fields
    const errorFields = checkRequiredField({ id });
    if (errorFields && errorFields.length) {
      res.json({
        code: CODE_ERROR,
        msg: errorFields.join(',') + ' can not be empty',
        data: null
      })
    }
    findData(id).then(data => {
      if (!data || data.length === 0) {
        res.json({
          code: CODE_ERROR,
          msg: 'delete data error',
          data: null
        })
      } else {
        const insertSql = `insert into booking_manage(id,unique_id,parent_id,status,dest, customer, ready_date, transit_time_require, mawb,flight,special_remark,selling,require_pickup,quantity_estimate,gross_weight_estimate,cmb_estimate,vol_estimate,dim_estimate,creater,create_time,action_type,extend)
     values(` + [getUuid(32), data.unique_id, data.id, 0, data.dest, data.customer, data.ready_date, data.transit_time_require, data.mawb, data.flight, data.special_remark, data.selling, data.require_pickup, data.quantity_estimate, data.gross_weight_estimate, data.cmb_estimate, data.vol_estimate, data.dim_estimate, username, Date.now(), 'deleted', data.extend].join(',') + `) and UPDATE booking_manage SET status=0 WHERE unique_id = ${id} LIMIT 2`;
        querySql(insertSql)
          .then(data => {
            // console.log('删除任务===', data);
            if (!data || data.length === 0) {
              res.json({
                code: CODE_ERROR,
                msg: 'delete data error',
                data: null
              })
            } else {
              res.json({
                code: CODE_SUCCESS,
                msg: 'delete data success',
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
    }).catch(() => {
      res.json({
        code: CODE_ERROR,
        msg: 'id is invalid!',
        data: null
      })
    })
  })
}

// modify Enquiry
function modifyEnquiry(req, res, next) {
  validRequest(req, next).then(({ username }) => {
    let { id } = req.body;
    // check required fields
    const errorFields = checkRequiredField({ id });
    if (errorFields && errorFields.length) {
      res.json({
        code: CODE_ERROR,
        msg: errorFields.join(',') + ' can not be empty',
        data: null
      })
    }
    findData(id).then(data => {
      if (!data || data.length === 0) {
        res.json({
          code: CODE_ERROR,
          msg: 'modify data error',
          data: null
        })
      } else {
        const assginedData = Object.assign({}, data, req.body);
        const insertSql = `insert into booking_manage(id,unique_id,parent_id,status,dest, customer, ready_date, transit_time_require, mawb,flight,special_remark,selling,require_pickup,quantity_estimate,gross_weight_estimate,cmb_estimate,vol_estimate,dim_estimate,creater,create_time,action_type,extend)
     values(` + [getUuid(32), assginedData.unique_id, assginedData.id, 1, assginedData.dest, assginedData.customer, assginedData.ready_date, assginedData.transit_time_require, assginedData.mawb, assginedData.flight, assginedData.special_remark, assginedData.selling, assginedData.require_pickup, assginedData.quantity_estimate, assginedData.gross_weight_estimate, assginedData.cmb_estimate, assginedData.vol_estimate, assginedData.dim_estimate, username, Date.now(), 'modified', assginedData.extend].join(',') + `) and UPDATE booking_manage SET status=0 WHERE id = ${id}  LIMIT 2`;
        querySql(insertSql)
          .then(data => {
            // console.log('删除任务===', data);
            if (!data || data.length === 0) {
              res.json({
                code: CODE_ERROR,
                msg: 'modify data error',
                data: null
              })
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
    }).catch(() => {
      res.json({
        code: CODE_ERROR,
        msg: 'id is invalid!',
        data: null
      })
    })
  })
}

// Enquiry query
function queryEnquiry(req, res, next) {
  validRequest(req, next).then(() => {
    let { id, sale_name, customer, dest, flight, page_size = 10, page_num = 1 } = req.body;
    // check required fields
     const errorFields = checkRequiredField({ id });
    if (errorFields && errorFields.length) {
      res.json({
        code: CODE_ERROR,
        msg: errorFields.join(',') + ' can not be empty',
        data: null
      })
    }

    const sql = `SELECT *
        FROM booking_manage
        WHERE 
            (id = ${id} OR ? IS NULL)
            AND (sale_name =  ${sale_name} OR ? IS NULL)
            AND (customer =  ${customer} OR ? IS NULL)
            AND (dest =  ${dest} OR ? IS NULL)
            AND (flight =  ${flight} OR ? IS NULL)
        LIMIT ${page_num} OFFSET ${page_size * (page_num - 1)}`;
    querySql(sql)
      .then(data => {
        // console.log('删除任务===', data);
        if (!data || data.length === 0) {
          res.json({
            code: CODE_ERROR,
            msg: 'modify data error',
            data: null
          })
        } else {
          res.json({
            code: CODE_SUCCESS,
            msg: 'query data success',
            data: data
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
  })
}



module.exports = {
  addEnquiry,
  deleteEnquiry,
  modifyEnquiry,
  queryEnquiry
}
