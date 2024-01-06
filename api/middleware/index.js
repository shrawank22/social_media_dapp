const Post = require('../models/post');
const Comment = require('../models/comment');

var middlewareObj = {};

middlewareObj.checkPostOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Post.findById(req.params.id, (err, post)=>{
			if(err || !post){
				req.flash("error", 'Sorry, that post does not exist!');
				res.redirect('back');
			} else {
			
				if(post.creator.id.equals(req.user._id)){
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

middlewareObj.checkCommentOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, (err, comment)=>{
			if(err || !comment){
				req.flash('error', 'Sorry, that comment does not exist!');
				res.redirect('back');
			} else {
				if(comment.creator.id.equals(req.user._id)){
					next();
				} else {
					req.flash('error', 'You are not authorized to do that');
					res.redirect('back');
				}
			}
		});
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