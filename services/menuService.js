/**
 * 描述: 业务逻辑处理 - 用户相关接口
 * 作者: feenyhe
 * 日期: 2023-9-20
*/


const { querySql } = require('../utils/index');
const { decode } = require('../utils/user-jwt');
const { validRequest } = require('./common');
const {
  CODE_ERROR,
  CODE_SUCCESS,
} = require('../utils/constant');

// covert Array to json by parent_id;
function covertToJson(list, parentId) {
  const result = {};
  const toJson = (arr, parentId, res) => {
    arr.forEach((obj, index) => {
      if (obj.parent_id === parentId) {
        res.children = res.children || [];
        res.children.push(obj);
        arr.splice(index, 0);
        toJson(arr, obj.id, obj);
      }
    })
  }
  toJson(list, parentId, result);
  return result.children
}
// quert menu list
function menuListQuery(req, res, next) {
  validRequest(req, next).then(() => {
    const token = req.get('Authorization')
    const { permission } = decode(token)
    const query = `select * from menu_manage where status = 1 and visible_permission >= ${permission}`;
    querySql(query).then((data) => {
      if ( data && data.length) {
        res.json({
          code: CODE_SUCCESS,
          msg: 'success',
          data: covertToJson(data, "-1")
        })
      } else {
        res.json({
          code: CODE_ERROR,
          msg: 'fail',
          data: null
        })
      }
    })
  })
}



module.exports = {
  menuListQuery,
}
