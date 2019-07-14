var express = require("express");
var router  = express.Router({mergeParams: true});
var Campground =require("../models/camground");
var Comment =require("../models/comment");
var middleware = require("../middleware");

////comments routes
router.get("/new",middleware.isLoggedIn, function(req, res){
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err);
		}
		else
			{
				res.render("comments/new", {campground: campground});
			}
	});
});
//create
router.post("/",middleware.isLoggedIn ,function(req,res){
	// lookup campground using ID
	Campground.findById(req.params.id, function(err, campground){
		if(err)
			{
				console.log(err);
				res.redirect("/campgrounds");
			}
			else
				{
					Comment.create(req.body.comment, function(err, comment){
						if(err)
							{	req.flash("error","something wen wrong");
								console.log(err);
							}
						else
							{
								//add username and id to comment
								comment.author.id =req.user._id;
								comment.author.username = req.user.username;
								comment.save();
								//save comment
								campground.comments.push(comment);
								campground.save();
								console.log(comment);
								req.flash("success","successfully added comment");
								res.redirect("/campgrounds/"+ campground._id);
							}
					});
			
				}
	});
});
//edit route comment
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
	Comment.findById(req.params.comment_id, function(err, foundComment){
		if(err){
			res.redirect("back");
		}
		else {
			res.render("comments/edit",{campground_id: req.params.id, comment: foundComment});
		}
	});
	
});
//comment update
router.put("/:comment_id", function(req, res){ //id defy, data need to update, function
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updateComment){
		if(err){
			res.redirect("back");
		}
		else
			{
				res.redirect("/campgrounds/" + req.params.id);
			}
	});
});
//comment destroy
router.delete("/:comment_id",middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		if(err){
			res.redirect("back");
		}
		else
			{
				req.flash("success","comment deleted");
				res.redirect("/campgrounds/" +req.params.id);
			}
	});
});


module.exports = router;