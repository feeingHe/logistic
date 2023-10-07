/**
 * 描述: 业务逻辑处理 - 用户相关接口
 * 作者: feenyhe
 * 日期: 2023-9-20
*/


const { querySql, queryOne } = require('../utils/index');
const { getToken, validRequest } = require('./common');
const { checkRequiredField, getUuid } = require('../utils/util')
const md5 = require('../utils/md5');
const {
  CODE_ERROR,
  CODE_SUCCESS,
} = require('../utils/constant');
const moment = require('moment');


// 登录
function login(req, res, next) {
  validRequest(req, res, next).then(() => {
    let { account, password } = req.body;
    const errorFields = checkRequiredField({ account, password });
    if (errorFields && errorFields.length) {
      res.json({
        code: CODE_ERROR,
        msg: errorFields.join(',') + ' can not be empty',
        data: null
      })
      return;
    }
    const query = `select * from user_manage where account='${account}' and password='${md5(password)}'`;
    getToken({
      account,
      sql: query,
      errMsg: 'Incorrect username or password',
      successMsg: 'login success',
      res,
    })
  }).catch((err)=>{
    console.log('add error:' + err.message)
  })
}


// 注册
function register(req, res, next) {
  validRequest(req, res, next).then(() => {
    let { account, password } = req.body;
    const errorFields = checkRequiredField({ account, password });
    if (errorFields && errorFields.length) {
      res.json({
        code: CODE_ERROR,
        msg: errorFields.join(',') + ' can not be empty',
        data: null
      })
      return;
    }
    findUser(account)
      .then(data => {
        console.log('用户注册===', data);
        if (data) {
          res.json({
            code: CODE_ERROR,
            msg: 'Account duplication！',
            data: null
          })
        } else {
          const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
          const query = `insert into user_manage(id,account, password,permission,create_time) values('${getUuid(32)}','${account}', '${md5(password)}',${10},'${timestamp}')`;

          querySql(query)
            .then(result => {
              // console.log('用户注册===', result);
              if (!result || result.length === 0) {
                res.json({
                  code: CODE_ERROR,
                  msg: 'sign up fail',
                  data: null
                })
              } else {
                const queryUser = `select * from user_manage where account='${account}' and password='${md5(password)}'`;
                getToken({
                  account,
                  sql: queryUser,
                  errMsg: 'sign up fail',
                  successMsg: 'sign up successful',
                  res,
                })
              }
            })
        }
      }).catch((err) => {
        console.log('用户注册err===', err);
        res.json({
          code: CODE_ERROR,
          msg: "err:" + err,
          data: null
        })
      })
  }).catch((err)=>{
    console.log('add error:' + err.message)
  })
}


// 重置密码
function resetPwd(req, res, next) {
  validRequest(req, res, next).then(() => {
    let { account, oldPassword, newPassword } = req.body;
    const errorFields = checkRequiredField({ account, oldPassword, newPassword });
    if (errorFields && errorFields.length) {
      res.json({
        code: CODE_ERROR,
        msg: errorFields.join(',') + ' can not be empty',
        data: null
      })
      return;
    }
    oldPassword = md5(oldPassword);
    validateUser(account, oldPassword)
      .then(data => {
        console.log('校验用户名和密码===', data);
        if (data) {
          if (newPassword) {
            const query = `update user_manage set password='${md5(newPassword)}' where account='${account}'`;
            querySql(query)
              .then(user => {
                // console.log('密码重置===', user);
                if (!user || user.length === 0) {
                  res.json({
                    code: CODE_ERROR,
                    msg: 'reset password fail',
                    data: null
                  })
                } else {
                  res.json({
                    code: CODE_SUCCESS,
                    msg: 'reset password sucess',
                    data: null
                  })
                }
              })
          } else {
            res.json({
              code: CODE_ERROR,
              msg: 'new password can not be empty',
              data: null
            })
          }
        } else {
          res.json({
            code: CODE_ERROR,
            msg: 'Incorrect username or old password',
            data: null
          })
        }
      })
  }).catch((err)=>{
    console.log('add error:' + err.message)
  })
}



// 校验用户名和密码
function validateUser(account, oldPassword) {
  const query = `select id, account from user_manage where account='${account}' and password='${oldPassword}'`;
  return queryOne(query);
}

// 通过用户名查询用户信息
function findUser(account) {
  const query = `select id, account from user_manage where account='${account}'`;
  return queryOne(query);
}

module.exports = {
  login,
  register,
  resetPwd
}
