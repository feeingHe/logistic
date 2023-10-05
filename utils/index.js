/**
 * 描述: 连接mysql模块
 * 作者: feenyhe
 * 日期: 2023-9-20
*/


const mysql = require('mysql');
const dbConfig = require('../db/dbConfig');

// 连接mysql
function connect() {
  const { host, user, password, database } = dbConfig;
  return mysql.createConnection({
    host,
    user,
    password,
    database
  })
}

// 新建查询连接
function querySql(sql) { 
  const conn = connect();
  console.log('--conn:',conn)
  return new Promise((resolve, reject) => {
    try {
      conn.query(sql, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res)
        }
      })
    } catch (e) {
      console.log('--conn.query:',e)
      reject(e);
    } finally {
      // 释放连接
      conn.end();
    }
  })
}

// 查询一条语句
function queryOne(sql) {
  console.log('rqueryOne===',sql)

  return new Promise((resolve, reject) => {
    querySql(sql).then(res => {
      console.log('res===',res)
      if (res && res.length > 0) {
        resolve(res[0]);
      } else {
        resolve(null);
      }
    }).catch(err => {
      console.log('querySql err===',err)
      reject(err);
    })
  })
}

module.exports = {
  querySql,
  queryOne
}