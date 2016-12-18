//使用原生的nodejs处理http比较麻烦 所以使用express框架
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
//处理cookie
var cookieParser = require('cookie-parser');
//处理请求
var bodyParser = require('body-parser');
//layout.ejs as model
var partials = require('express-partials');
//connect to mongodb
var mongoose = require('mongoose');
var routes = require('./routes/index');
//session
var session    = require('express-session');
//store session
var MongoStore = require('connect-mongo')(session);
var flash =require('connect-flash');
var app = express();
//custom middleware
var loginFilter=require('./model/loginFilter');
var registerFilter=require('./model/registerFilter');
var blogFilter=require('./model/blogFilter');
var updateBlogFilter=require('./model/updateBlogFilter');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
console.log(__dirname);
app.use(favicon(__dirname + '/public/images/blog.ico'));
//使用中间件 注意顺序
app.use(logger('dev'));
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret:"sessionInfo",
    key:"sessionInfo",
    cookie:{maxAge:1000*60*60},
    store:new MongoStore({db:"sessionInfo"})
}));
app.use(flash());
//静态文件css等的位置
app.use(express.static(path.join(__dirname, 'public')));

//express4.0新增的处理路由的方法
//app.route("/login")
//    .get(routes.login)
//    .post(routes.doLogin);
//使用自定义的中间件
//app.use(loginFilter.loginFilter());

app.get('/', routes.index);
app.get('/myBlog', routes.myBlog);
app.post('/otherBlog', routes.otherBlog);
app.get('/login', routes.login);
app.post("/login",loginFilter.loginFilter());
app.post('/login', routes.doLogin);
app.get('/register', routes.register);
app.post("/register",registerFilter.registerFilter());
app.post('/register', routes.doRegister);
app.get("/blog",routes.blog);
app.post("/blog",blogFilter.blogFilter());
app.post("/blog",routes.doBlog);
app.get("/deleteBlog/:id",routes.deleteBlog);
app.get("/updateBlog/:id",routes.beforeUpdateBlog);
app.post("/updateBlog",updateBlogFilter.updateBlogFilter());
app.post("/updateBlog",routes.updateBlog);
app.get('/logout', routes.logout);

mongoose.connect('mongodb://localhost/blog');

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// error handlers
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
      flag:false
    });
  });
}

module.exports = app;
