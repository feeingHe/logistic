/**
 * 描述: 入口文件
 * 作者: feenyhe
 * 日期: 2023-9-20
*/

const bodyParser = require('body-parser'); // 引入body-parser模块
const express = require('express'); // 引入express模块
// const cors = require('cors'); // 引入cors模块
const routes = require('./routes'); //导入自定义路由文件，创建模块化路由
const app = express();
const path = require('path'); // 引入path模块
const port = process.env.PORT || 9199; // 端口

const compression = require('compression');

// 设置模板引擎
var ejs = require('ejs');
app.engine('html', ejs.__express);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));

app.use(compression()); // 解析json数据格式
app.use(bodyParser.json()); // 解析json数据格式
app.use(bodyParser.urlencoded({ extended: true })); // 解析form表单提交的数据application/x-www-form-urlencoded

// app.use(cors()); // 注入cors模块解决跨域
// // 设置允许跨域访问的域名和端口
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-requestId, Content-Type, Accept");
//     next();
// });


app.use('/', routes);
app.get('/index', function (req, res) {
    res.render('index', { title: 'Express' });
});
app.listen(port, () => { // 监听端口
    console.log('服务已启动 http://localhost:' + port);
})

process.on('uncaughtException', err => {
    console.log('---发生了奔溃性的错误：', err)
    //do something
});

// // 定义全局异常处理中间件
// app.use((err, req, res) => {
// 	console.error(err.stack);
// 	res.status(500).send('Something broke!');
//   });