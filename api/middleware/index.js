const Blog = require('../src/models/Blog');

var middlewareObj = {};

middlewareObj.checkBlogOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Blog.findById(req.params.id, (err, blog)=>{
			if(err || !blog){
				req.flash("error", 'Sorry, that blog does not exist!');
				res.redirect('back');
			} else {
				//console.log(blog);
				if(blog.author.id.equals(req.user._id)){
					next();
				} else {
					req.flash('error', 'You are not allowed to do that');
					res.redirect('back');
				}
			}
		})
	} else {
		req.flash('error', 'You need to be logged in to do that!');
		res.redirect('/login');
	}
}

middlewareObj.isLoggedIn = function (req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
	req.flash("error", "You need to be logged in to do that");
    res.redirect('/login');
}

module.exports = middlewareObj;