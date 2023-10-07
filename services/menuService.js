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
// insert into logistic.menu_manage(id,text,parent_id,status,visible_permission,create_time,creator,url) VALUES('56asd0a9876dgafesadf','Main','-1',1,19,'2023-9-29 10:00:00','feenyhe','/home');
// insert into logistic.menu_manage(id,text,parent_id,status,visible_permission,create_time,creator,url) VALUES('0987hkkasduiowqe6gbs','Inquiry Insert','56asd0a9876dgafesadf',1,19,'2023-9-29 10:01:49','feenyhe','/home/inquiry');
// insert into logistic.menu_manage(id,text,parent_id,status,visible_permission,create_time,creator,url) VALUES('okhhykasdre9qwe131da','Booking Manage','56asd0a9876dgafesadf',1,19,'2023-9-29 10:01:49','feenyhe','/home/booking');
// insert into logistic.menu_manage(id,text,parent_id,status,visible_permission,create_time,creator,url) VALUES('lknbdrtgbvcseertg865','Planning','56asd0a9876dgafesadf',1,19,'2023-9-29 10:02:49','feenyhe','/home/planning');
// insert into logistic.menu_manage(id,text,parent_id,status,visible_permission,create_time,creator,url) VALUES('khgiuyuiod79asdadasf','Log','-1',1,19,'2023-9-29 10:01:28','feenyhe','/log');
// quert menu list
function menuListQuery(req, res, next) {
  validRequest(req,res, next).then(() => {
    // const token = req.get('Authorization')
    const {permission} = decode(req);
    const query = `select * from menu_manage where status = 1 and visible_permission >= ${permission}`;
    querySql(query).then((data) => {
      if (data && data.length) {
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
  }).catch((err)=>{
    console.log('add error:' + err.message)
  })
}



module.exports = {
  menuListQuery,
}
