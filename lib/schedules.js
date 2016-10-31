var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

var Schema = mongoose.Schema;

var schedulesSchema = new Schema({
	_bookedTutor:{type: Schema.Types.ObjectId, ref:'Tutor', required:true},
    _bookedBy:{type:Schema.Types.ObjectId, ref:'Student', required:true},
    tutorConfirm:{type:Boolean, 'default':false},
    rejectSchdule:{type:Boolean, 'default':false},
    bookedFor:{type:String},//Booked subjects
    scheduledTime:{type:Number, required:true},
    happen:{type:Boolean, 'default':false},
	dateCreated:Date
},{ collection: 'Schedules' })

var Rating = mongoose.model('Schedules', schedulesSchema);

schedulesSchema.pre('save', function(next) {
    // get the current date
    var currentDate = new Date();

    // if created_at doesn't exist, add to that field
    if (!this.dateCreated)
        this.dateCreated = currentDate;
    next();
});