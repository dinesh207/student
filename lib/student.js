var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

var Schema = mongoose.Schema;

//create a schema
var studentSchema = new Schema({
    firstName: { type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String,required: true, unique: true, index: true},
    password: { type: String },
    grade:{type:String},
    salt: { type: String },
    token: { type: String },
    enabled: { type: Boolean, 'default': true },
    needReset: { type: Boolean, 'default': false },
    created_at: Date,
    updated_at: Date
}, { collection: 'Student' });

studentSchema.set('autoIndex', false);

studentSchema.pre('save', function(next) {
    // get the current date
    var currentDate = new Date();

    // change the updated_at field to current date
    this.updated_at = currentDate;

    // if created_at doesn't exist, add to that field
    if (!this.created_at)
        this.created_at = currentDate;

    next();
});


studentSchema.methods.setPassword = function(password){
    this.salt = bcrypt.genSaltSync(12)
    console.log("salt = "+this.salt)
    this.password = bcrypt.hashSync(password, this.salt)
};

studentSchema.methods.generateJwt = function() {
    var expiry = new Date()
    expiry.setDate(expiry.getDate() + 30)

    return jwt.sign({
        _id: this._id.toString(),
        username: this.username,
        exp: parseInt(expiry.getTime() / 1000),
    }, process.env.JWT_SECRET)
}

studentSchema.statics.verifyJwt = function(token, callback) {
    jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
        if(err) {
            callback(err)
        }
        else {
            callback(null, true)
        }
    })

}

studentSchema.methods.authenticate = function(password) {
    var hashPass = bcrypt.hashSync(password, this.salt)
    if(hashPass == this.password) {
        return true;
    }
    else {
        return false;
    }

}

var Student = mongoose.model('Student', studentSchema);
//make this available to our users in our Node applications
