var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

var Schema = mongoose.Schema;
var ratingSchema = new Schema({
    givenById:{type: Schema.Types.ObjectId, ref:'Student'},
    givenBy:{type:String, required:true},
    value: {type:Number,required:true},
    when: {type:Date, 'default':new Date()}
})
//create a schema
var tutorSchema = new Schema({
    firstName: { 
        type: String, 
        required: true
    },
    lastName: {
        type: String, 
        required: true
    },
    email: {
        type: String,
        required: true, 
        unique: true, 
        index: true
    },
    subjects:[String],
    availability:[{
    available:{type:Number, required:true}, 
    isawaiting:{type:Boolean, 'default':false}
    }], // Available on single day and time, or multiple days and time
    fromDate:{type:Date, required:false}, // Can choose date from available
    toDate:{type:Date, required:false}, // Can choose date to available
    password: { 
        type: String 
    },
    grade:{
        type:String
    },
    ratings:[{type:Schema.Types.ObjectId, ref:'Rating'}],
    salt: { 
        type: String 
    },
    token: { 
        type: String 
    },
    enabled: { 
        type: Boolean, 
        'default': true 
    },
    needReset: { 
        type: Boolean, 
        'default': false
    },
    created_at: Date,
    updated_at: Date
}, { collection: 'Tutor' });

tutorSchema.set('autoIndex', false);

tutorSchema.index({subjects: 'text'});

tutorSchema.pre('save', function(next) {
    // get the current date
    var currentDate = new Date();

    // change the updated_at field to current date
    this.updated_at = currentDate;

    // if created_at doesn't exist, add to that field
    if (!this.created_at)
        this.created_at = currentDate;

    next();
});


tutorSchema.methods.setPassword = function(password){
    this.salt = bcrypt.genSaltSync(12)
    console.log("salt = "+this.salt)
    this.password = bcrypt.hashSync(password, this.salt)
};

tutorSchema.methods.generateJwt = function() {
    var expiry = new Date()
    expiry.setDate(expiry.getDate() + 30)

    return jwt.sign({
        _id: this._id.toString(),
        username: this.username,
        exp: parseInt(expiry.getTime() / 1000),
    }, process.env.JWT_SECRET)
}

tutorSchema.statics.verifyJwt = function(token, callback) {
    jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
        if(err) {
            callback(err)
        }
        else {
            callback(null, true)
        }
    })

}

tutorSchema.methods.authenticate = function(password) {
    var hashPass = bcrypt.hashSync(password, this.salt)
    if(hashPass == this.password) {
        return true;
    }
    else {
        return false;
    }

}

var Tutor = mongoose.model('Tutor', tutorSchema);
//make this available to our users in our Node applications
