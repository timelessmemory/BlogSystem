exports.updateBlogFilter = function() {
    return function(req, res, next){
        if (!req.body.title||!req.body.content) {
            req.flash("error","标题或者内容不能为空!");
            return res.redirect('/updateBlog/'+req.body.id);
        } else{
            next();
        }
    };
}