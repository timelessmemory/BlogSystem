exports.blogFilter = function() {
    return function(req, res, next){
        if (!req.body.title||!req.body.content) {
            req.flash("error","标题或者内容不能为空!");
            req.flash("content",req.body.content);
            return res.redirect('/blog');
        } else{
            next();
        }
    };
}