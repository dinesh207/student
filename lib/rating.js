var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

var Schema = mongoose.Schema;

var ratingSchema = new Schema({
	_tutorId:{type: Schema.Types.ObjectId, ref:'Tutor'},
	_givenBy:{type: Schema.Types.ObjectId, ref:'Student'},
    author:{
        firstName: {type:String, required:true},
        lastName: {type:String, required:true},
        email: {type:String, required:true}
    },
	rating:{type:Number, required:true},
	review:{type:String, required:false, 'default':''},
	dateCreated:Date
},{ collection: 'Rating' })

var Rating = mongoose.model('Rating', ratingSchema);

ratingSchema.pre('save', function(next) {
    // get the current date
    var currentDate = new Date();

    // if created_at doesn't exist, add to that field
    if (!this.dateCreated)
        this.dateCreated = currentDate;
    next();
});