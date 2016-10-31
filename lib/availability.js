var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

var Schema = mongoose.Schema;

var availabilitySchema = new Schema({
	_tutorId:{type: Schema.Types.ObjectId, ref:'Tutor'},
    available:[{type:Date, required:true}], // Available on single day and time, or multiple days and time
    fromDate:{type:Date, required:false}, // Can choose date from available
    toDate:{type:Date, required:false}, // Can choose date to available
	dateCreated:Date
},{ collection: 'Availability' })

var Rating = mongoose.model('Availability', availabilitySchema);

availabilitySchema.pre('save', function(next) {
    // get the current date
    var currentDate = new Date();

    // if created_at doesn't exist, add to that field
    if (!this.dateCreated)
        this.dateCreated = currentDate;
    next();
});