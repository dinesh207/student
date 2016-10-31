var express = require('express');
var ObjectId = require ('mongodb').ObjectID;
var mongoose = require('mongoose');
var passwordGenerator = require("password-generator");
var Student = mongoose.model('Student');
var Tutor = mongoose.model('Tutor');
var Rating = mongoose.model('Rating');
var Comment = mongoose.model('Comment');
var CommentThread = mongoose.model('CommentThread');
var Schedules = mongoose.model('Schedules');
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer')
var validator = require('validator')
var async = require("async");



// exports.creatComment = function(req, res){
// 	var comment = new Comments();
// 	comment._projectID = req.body.projectID
// 	comment._givenBy = req.body.author
// 	comment.comment = req.body.comment
// 	comment.save(function(err, comment){
// 		if(err){
// 			sendJSONresponse(res, 404,{"message":"unable to store comment"})
// 			return;
// 		}
// 		sendJSONresponse(res, 200, {"message":"comment stored"})
// 	})
// }
exports.creatComment = function(req, res){
	if(req.body.projectID){
		var commentThread = new CommentThread()
		commentThread.projectID = req.body.projectID
		commentThread.createdBy = req.body.author
		commentThread.comment = req.body.comment
		commentThread.save(function(err, comment){
			if(err){
				sendJSONresponse(res, 404,{"message":"unable to store comment"})
				return;
			}
			sendJSONresponse(res, 200, comment);
		})

	}else{
		sendJSONresponse(res, 404, {"message":"projectId not found"});
	}

}
exports.creatReply = function(req, res){
	var commentThreadID = req.body.commentID;
	var parentCommentID = req.body.parentCommentID;
	if(!commentThreadID){
		sendJSONresponse(res, 404,{"message":"no comment thread found"});
		return;
	}
	CommentThread.findOne({'_id':commentThreadID})
	.exec(function(err, commentThread){
		if(err){
			sendJSONresponse(res, 500, {"message":"error finding parent comment"});
			return;
		}
		var reply = {
			"_givenBy":req.body.author,
			"comment":req.body.comment
		};
		var newComment = Comment(reply);
		addReply(req, res, commentThread, commentThread, parentCommentID, newComment);
	})
}
var addReply = function(req, res, commentThread, currentComment,parentID, newComment){
	if(commentThread._id == parentID){
		commentThread.replies.push(newComment);
		updateCommentThread(req, res, commentThread);
	}else{
		for (var i = 0; i < currentComment.replies.length; i++) {
			var c = currentComment.replies[i];
			if(c._id == parentID){
				c.replies.push(newComment);
				var replyThread = commentThread.replies.toObject();
				updateCommentThread(req, res, commentThread);
				break;
			}else{
				addReply(req,res,commentThread, c, parentID, newComment)
			}
		}
	}
}
var updateCommentThread =  function(req, res, commentThread){
	CommentThread.findOneAndUpdate({'_id': commentThread._id},{$set:{'replies':commentThread.replies}})
	.exec(function(err, commentThread){
		if(err){
			sendJSONresponse(res, 500, {"message":"error updating commentThread"});
			return;
		}
		sendJSONresponse(res, 200, commentThread);
	})
}
// exports.creatReply = function(req, res){
// 	var comment = new Comments()
// 	var commentID = req.body.commentID;
// 	var reply = {};
// 	reply.reply = req.body.comment;
// 	reply._givenBy = req.body.author;
// 	Comments.findById(commentID)
// 	.exec(function(err, comment){
// 		if(err){
// 			sendJSONresponse(res, 404,{"message":"unable to store comment"})
// 			return;
// 		}
		
// 	})

// 	comment.save(function(err, reply){
// 		if(err){
// 			sendJSONresponse(res, 404,{"message":"unable to store comment"})
// 			return;
// 		}
// 		Comments.findOneAndUpdate({'_id':ObjectId(commentID)},
// 		{$push:{'replies':reply._id}},function(err, comment){
// 			if(err){
// 				sendJSONresponse(res, 404,{"message":"unable to store comment"})
// 				return;
// 			}
// 			sendJSONresponse(res, 200, {"message":"comment stored"})
// 		})	
// 	})
// }
// exports.getComments = function(req, res){
// 	var data = {};
// 	// Comments.find()
// 	// 		.populate({path:'replies', populate:{path:'replies'}})
// 	// 		//.populate({path:'replies', populate:{path:'replies'}})
// 	// 		.exec(function(err, comments){
// 	// 			if(err){
// 	// 				sendJSONresponse(res, 500, {"message":"No comments"});
// 	// 			}
// 	// 			// async.mapLimit(comments, 10, function(comment, callback){
// 	// 			// 		var eachComment = [];

// 	// 			// 		if(comment._id = comments.parent_comment_id){
							
// 	// 			// 		}
// 	// 			// 	}

// 	// 			// }, function(err, results){
// 	// 			// 	console.log('add all replies');
// 	// 			// })
// 	// 			sendJSONresponse(res, 200, comments)
// 	// 		})
// 	Comments.find({'parent_comment_id':null})
// 			.exec(function(err, comments){
// 				if(err){
// 	 				sendJSONresponse(res, 500, {"message":"No comments"});
// 	 			}
// 	 			async.mapLimit(comments, 10, function(comment, callback){
// 	 				Comments.find({'parent_comment_id':comment._id})
// 	 					.exec(function(err, allReplies){
// 	 						if(err){
// 	 							sendJSONresponse(res, 500, {"message":"No comments"});
// 	 						}
// 	 						comment.replies.push(allReplies);
	 						
// 	 			})
// 	 			    sendJSONresponse(res, 200, comments);
// 	 			})
	 			

// 			})
// }

exports.addLike = function(req, res){
	var commentID = req.body.commentID;
	var replyID = req.body.replyID;
	if(!commentID){
		sendJSONresponse(res, 404, {"message":"no comment Id is provided"})
		return;
	}
	if(!replyID){
		CommentThread.findOne({'_id':commentID})
		.exec(function(err, commentThread){
			if(err){
				sendJSONresponse(res, 500, {"message":"error finding parent comment"});
				return;
			}
			var like = {
				"likedBy":req.body.author,
				"when": new Date()
			};
			commentThread.likes.push(like);
		})
	}
	addLikeToComment(req, res, commentID);
}
var addLikeToComment = function(req, res, commentID){

}

var sendJSONresponse = function(res, status, content) {
	res.status(status);
	res.json({ "status" : status,
		"content" : content
	});
};
