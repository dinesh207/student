var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

var Schema = mongoose.Schema;

var replySchema = new Schema({
	_givenBy:{type:String},
    comment:{type:String, required:true},
    likes:[{
    	likedBy:{type:String},
    	when:{type:Date, 'Default':new Date()}
    }],
	dateCreated:{type:Date,'Default':new Date()}
},{ collection: 'Comment' })

replySchema.add({
    replies:[replySchema]
})
var commentThread = new Schema({
    projectID:{type:Schema.Types.ObjectId, ref:'Tutor'},
    createdBy:{type: String},
    dateCreated:{type:Date,'Default':new Date()},
    comment:{type:String, required:true},
    likes:[{
    	likedBy:{type:String},
    	when:{type:Date, 'Default':new Date()}
    }],
    replies:[replySchema]
},{ collection: 'CommentThread' }) 

// var commentSchema = new Schema({
//     _projectID:{type: String},
//     _givenBy:{type: String},
//     parent_comment_id:{type:Schema.Types.ObjectId, 'Default':null},
//     comment:{type:String, required:true},
//     replies:[{type:Schema.Types.ObjectId, ref:'Comment'}],
//     dateCreated:Date
// }, {collection:'Comment'})
var Comment = mongoose.model('Comment', replySchema);
var commentThread = mongoose.model('CommentThread', commentThread)

// commentSchema.pre('save', function(next) {
//     // get the current date
//     var currentDate = new Date();

//     // if created_at doesn't exist, add to that field
//     if (!this.dateCreated)
//         this.dateCreated = currentDate;
//     next();
// });