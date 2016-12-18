/**
 * Created by Timeless on 2015/3/29.
 */
exports.registerFilter = function() {
    return function(req, res, next){
        if (!req.body.name||!req.body.password||!req.body.password2) {
            req.flash("error","用户名或密码不能为空!");
            return res.redirect('/register');
        } else if (req.body.password!=req.body.password2){
            req.flash("error","两次输入的密码不一致!");
            return res.redirect('/register');
        } else{
            next();
        }
    };
}