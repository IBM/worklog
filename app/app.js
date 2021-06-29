
const express = require('express')
const app = express()
require('dotenv').config();

/**
 * routesフォルダにapiのファイルを作成したらここで読み込みを行う
 */
// ルーティング先
var loginRouter = require('./routes/login');
var userRouter = require('./routes/user');
var samplesRouter = require('./routes/samples');

/**
 * 以下の方法でルーティングを行う
 * app.use(apiパス, ルーティング先);
 */
// ルーティング
app.use('/api/v1/login', loginRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/samples', samplesRouter);                              

var path = require('path');


app.listen(process.env.PORT || 5000, () => console.log('Example app listening on port 5000!　http://localhost:5000/'))

// catch 404 and forward to error handler           // ルーティングで該当先が無かったら、404画面を表示するミドルウェア。
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// // error handler                                    // エラーが発生したら、500画面を表示するミドルウェア。
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('エラーが発生しました。500画面表示。');
// });

// module.exports = app;