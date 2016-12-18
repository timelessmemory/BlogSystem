//schema(structure)->model(table)->entity(one record)
var userModel = require('../model/schema');
var blogModel = require('../model/blogSchema');
var crypto = require('crypto');

//主页 显示三条博客信息
exports.index = function(req, res){
    var param=req.session.user;

    blogModel.find()
        .limit(3)
        .exec(function(error,results){

            if(undefined==param){
                //标记未登录 res.locals对象保存属性可以在ejs中访问
                //但是每个res.locals是独立的 其他请求访问不到其他请求的属性
                if(!error) {
                    res.locals.blogs=results;
                }else{
                    res.locals.blogs="";
                }
                res.locals.flag=false;
                //相当于页面转发
                res.render('index',{ title: 'please login' });

            }else{

                if(!error) {
                    res.locals.blogs=results;
                }else{
                    res.locals.blogs="";
                }
                res.locals.flag=true;
                res.locals.user=param;
                res.render('index',{ title: param });
            }
    });

};

//当前登录人的博客
exports.myBlog = function(req, res){
    var param=req.session.user;
    blogModel.find()
        .where("user").equals(param)
        .exec(function(error,results){

                if(!error) {
                    res.locals.blogs=results;
                }else{
                    res.locals.blogs="";
                }
                res.locals.flag=true;
                res.locals.user=param;
                res.render('myBlog',{ title: param });
        });
};

//删除当前登录人的博客
exports.deleteBlog = function(req, res){
    console.log(req.params.id);
    blogModel.remove({_id:req.params.id},function(error){
        if(!error){
            //页面重定向
            return res.redirect("/myBlog");
        }else{
            return error;
        }
    });
};

//回写更新博客的原文
exports.beforeUpdateBlog = function(req, res){
    blogModel.find()
        .where("_id").equals(req.params.id)
        .exec(function(error,results){

            if(!error) {
                res.locals.blogcontent=results[0].contents;
                res.locals.blogtitle=results[0].title;
                res.locals.blogid=results[0]._id;
            }else{
                res.locals.blogcontent="";
            }
            res.locals.error=req.flash("error");
            res.locals.flag=true;
            res.locals.user=req.session.user;
            res.render('updateblog',{ title:'updateblog' });
        });
};

//更新当前登录人的博客
exports.updateBlog = function(req, res){
    console.log("update=========");
    blogModel.update(
        {_id:req.body.id},
        {$set:{title:req.body.title,contents:req.body.content}},
        { multi: true },
        function(error,results){
            if(!error) {
                return res.redirect("/myBlog");
            }else{
                return error;
            }
        }
    );
};

//搜索他人的博客
exports.otherBlog = function(req, res){
    var param=req.session.user;
    blogModel.find()
        .where("user").equals(req.body.othername)
        .exec(function(error,results){

            if(!error) {
                res.locals.blogs=results;
            }else{
                res.locals.blogs="";
            }
            res.locals.flag=true;
            res.locals.user=param;
            res.locals.otherUser=req.body.othername;
            res.render('otherBlog',{ title: param });
        });

};

//登录页面
exports.login = function(req, res){
    res.locals.flag=false;
    res.locals.error=req.flash("error");
    if(req.cookies.userinfo!=undefined){
        res.locals.username=req.cookies.userinfo.name;
        res.locals.password=req.cookies.userinfo.password;
    }else{
         res.locals.username=undefined;
         res.locals.password=undefined;
    }
    res.render('login', { title: 'login' });
};

//注册页面
exports.register = function(req, res){
    //console.log(req.cookies.username);
    res.locals.flag=false;
    res.locals.error=req.flash("error");
    res.render('register', { title: 'register' });
};

//撰写博客的页面
exports.blog = function(req, res){
    res.locals.flag=true;
    res.locals.user=req.session.user;
    res.locals.error=req.flash("error");
    res.locals.content=req.flash("content");
    res.render('blog', { title: 'blog' });
};

exports.doLogin = function(req, res){

    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    var userObject={name: req.body.name, password: password};

    userModel.find(userObject, function (err, users) {
        if(!err){
            console.log(users);
            if(users.length) {
                if(req.body.rem!=undefined){
                    res.cookie("userinfo",{name: req.body.name, password: req.body.password},{ maxAge:20*60*1000,httpOnly:true, path:'/'});
                }
                req.session.user=users[0].name;
                console.log("login success!");
                return res.redirect("/");
            }else{
                //console.log("error user and password");
                //return res.redirect("/login");
                res.locals.flag=false;
                res.locals.error="账号密码不正确，请重新登录!";
                res.render('login', { title: 'login' });
            }
        }else{
            console.log("unknown error");
        }
    });
};

exports.doRegister = function(req, res){
    //生成md5的密码
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    var userObject={name: req.body.name, password: password};
    userModel.find({name: req.body.name},function(err,users){
        if(!err){
            if(!users.length){
                var userEntity = new userModel(userObject);
                userEntity.save(function (err, user) {
                    if(!err){
                        console.log("regist success!");
                        return res.redirect("/login");
                    }else{
                        console.log("unknow error!");
                    }
                });
            }else{
                //console.log("have be registed,please register again");
                //return res.redirect("/register");
                res.locals.flag=false;
                res.locals.error="账号密码已被注册，请重新注册!";
                res.render('register', { title: 'register' });
            }
        }
    });
};

exports.doBlog = function(req, res){
    var date=new Date();
    var myDate=date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()
        +" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
    console.log(myDate);
    var blogObject={user: req.session.user, subDate:myDate,title:req.body.title,contents:req.body.content};
    var blogEntity = new blogModel(blogObject);
    blogEntity.save(function (err, user) {
        if(!err){
            console.log("subContent success!");
            return res.redirect("/");
        }else{
            console.log("unknow error!");
        }
    });
};

exports.logout = function(req, res){
    req.session.destroy();
    res.redirect('/');
};

//add
//var userEntity=new userModel({name:req.body.name,password:req.body.password});
//console.log(userEntity);
//userEntity.save(function (err, user) {
//});

//query and update person[0]==document=entity(a little difference)
//userModel.find(function(err,person){
//    person[0].name="";
//    person[0].save(function(err,user){});
//});

//add
//var userObject = {name:req.body.name,password:req.body.password};
//userModel.create(userObject,function(error,user){
//    console.log(user);
//});

//userModel.find({name:"lijainfei",password:"123"},function(err,user){
//    console.log(err);
//    console.log(user);
//});

