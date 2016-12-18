/**
 * Created by Timeless on 2015/3/28.
 */
exports.loginFilter = function() {
    return function(req, res, next){
        if (!req.body.name||!req.body.password) {
            //flash相当于session  但是生命周期是下次读取完就消失
            req.flash("error","用户名或密码不能为空!");
            return res.redirect('/login');
        } else {
            next();
        }
    };
}
