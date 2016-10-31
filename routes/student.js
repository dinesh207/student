var express = require('express');
var ObjectId = require ('mongodb').ObjectID;
var mongoose = require('mongoose');
var passwordGenerator = require("password-generator");
var Student = mongoose.model('Student');
var Tutor = mongoose.model('Tutor');
var Rating = mongoose.model('Rating');
var Schedules = mongoose.model('Schedules');
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer')
var validator = require('validator')
var async = require("async");

var shouldSendMails = true;

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'instatutorcontact@gmail.com', // Your email id
        pass: '3sfgeese' // Your password
    }
})

exports.ShouldSendMails = function(sendMails) {
	shouldSendMails = sendMails
}


exports.Create = function(req, res) {
	var student = new Student()
	var email = req.body.email
	if(email && validator.isEmail(email)) {
		Student.findOne({ 'email' : email })
		.exec(function(err, presentStudent) {
			if (presentStudent) {
				sendJSONresponse(res, 409, {
					"message": "Student with requested username already found"
				});
				return;
			} else if (err) {
				console.log(err);
				sendJSONresponse(res, 500, err);
				return;
			}
			student.email = req.body.email
			//var pass = generatePassword() For now disabling ontime password
			//student.setPassword(pass)
			student.setPassword(req.body.password)
			student.enabled = true
			student.needReset = true
			student.firstName = req.body.firstname
			student.lastName = req.body.lastname
			student.grade = req.body.grade
			student.save(function(err, newStudent) {
				if (err) {
					sendJSONresponse(res, 500, err);
					return
				} else {
					sendJSONresponse(res, 200, {
						"message": "OK"
					});
					//send mail
					var subject = "Instatutor Welcomes You"
					var content = "Dear "+newStudent.firstName+' '+newStudent.lastName+"\n\n Thank you for registering for instatutor. We look forward to helping you get connected to tutors. \n Your username is: "+
					newStudent.email+"\n Your Password is: "+req.body.password;
					sendMail(newStudent.email, subject, content)
					return
				}
			});
		})
	}
	else {
		sendJSONresponse(res, 404, {
			"message": "student username or email not found or not valid format in request"
		});
		return
	}

}

exports.VerifyToken = function(req, res, next) {
	var token = (req.body && req.body.access_token) ||
	(req.query && req.query.access_token) ||
	req.headers['x-access-token'];
	if(!token) {
		sendJSONresponse(res, 403, {
			"message": "Token not present"
		});
		return
	}
	Student.verifyJwt(token, function(error, flag) {
		if(error) {
			sendJSONresponse(res, 403,error);
			return
		}
		var decoded = jwt.verify(token, process.env.JWT_SECRET)
		module.exports.getById(decoded._id, function (err, student) {
			if(err) {
				sendJSONresponse(res, 403,error);
				return
			}
			if(student) {
				req.student = student
				next()
				// if(student.token) {
				// 	if(student.needReset === true && req.path != "/UpdatePassword") {
				// 		sendJSONresponse(res, 401, {
				// 			"message": "Need password reset"
				// 		});
				// 		return
				// 	}
				// 	req.student = student
				// 	next()
				// }
				// else {
				// 	sendJSONresponse(res, 403, {
				// 		"message": "Invalid Token"
				// 	})
				// }
				//sendJSONresponse(res, 200, student);
			}
			else {
				sendJSONresponse(res, 404,{
					"message": "Student not present"
				});
				return
			}
		})

	})
}
// exports.findTutors = function(req,res){
// 	var student = req.student;
// 	if(student){
// 		var subjects = req.body.subjects;
// 		var tutorsInfo = [];
// 		Tutor.find({subjects:{$in: subjects}})
// 		.populate({path:'ratings',populate: { path: '_givenBy', select:'firstName lastName email' }})
// 		.exec(function(err, tutors){
// 			if(err){
// 				sendJSONresponse(res, 404, err)
// 				return
// 			}
			
// 			tutors.forEach(function(tutor){
// 				var info = {};
// 				info._id=tutor._id;
// 				info.firstName = tutor.firstName;
// 				info.lastName = tutor.lastName;
// 				info.grade = tutor.grade;
// 				info.email = tutor.email;
// 				info.availability = tutor.availability;
// 				info.subjects = tutor.subjects;
// 				info.ratings = tutor.ratings;
// 				info.enabled = tutor.enabled;
// 				info.awaitingAvailability = tutor.awaitingAvailability;
// 				info.needReset = tutor.needReset;
// 				info.created_at = tutor.created_at;
// 				info.updated_at = tutor.updated_at;
// 				tutorsInfo.push(info);
// 			})
// 			sendJSONresponse(res, 200, tutorsInfo);
// 		})
// 	}
// }
//Finding with $text and $search
exports.findTutors = function(req,res){
	var student = req.student;
	if(student){
		//var subjects = req.body.subjects;
		var tutorsInfo = [];
		Tutor.find({$text:{$search: req.params.subject}})
		// Tutor.find({subjects:{$in: subjects}})
		.populate({path:'ratings',populate: { path: '_givenBy', select:'firstName lastName email' }})
		.exec(function(err, tutors){
			if(err){
				sendJSONresponse(res, 404, err)
				return
			}
			
			tutors.forEach(function(tutor){
				var info = {};
				info._id=tutor._id;
				info.firstName = tutor.firstName;
				info.lastName = tutor.lastName;
				info.grade = tutor.grade;
				info.email = tutor.email;
				info.availability = tutor.availability;
				info.subjects = tutor.subjects;
				info.ratings = tutor.ratings;
				info.enabled = tutor.enabled;
				info.awaitingAvailability = tutor.awaitingAvailability;
				info.needReset = tutor.needReset;
				info.created_at = tutor.created_at;
				info.updated_at = tutor.updated_at;
				tutorsInfo.push(info);
			})
			sendJSONresponse(res, 200, tutorsInfo);
		})
	}
}
//Get upcoming schedules
exports.upcomingSchedules = function(req, res){
	var student = req.student;
	if(student){
		Schedules.find({'_bookedBy':ObjectId(req.student._id),'happen':false, 'tutorConfirm':true})
		.populate({path:'_bookedTutor', select:'firstName lastName email' })
		.exec(function(err, schedules){
			if(err){
				sendJSONresponse(res, 500, {"message":"getting schedules error"});
				return
			}
			sendJSONresponse(res, 200, schedules);
		})
	}else{
		sendJSONresponse(res, 404, {"message":"Student not available"});
	}
}

exports.bookTutor = function(req, res){
	var student = req.student;
	if(student){
		var schedules = new Schedules();
		schedules._bookedTutor = req.body.tutorId;
		schedules._bookedBy = student._id;
		schedules.bookedFor = req.body.subjects;
		schedules.scheduledTime = req.body.slotTime;
		isTutoravalable(req,res, function(err,availableTutor){
			if(availableTutor == null){
				sendJSONresponse(res, 404, {"message":"tutor not available"});
				return;
			}else{
				schedules.save(function(err, schedule){
					if(err){
						sendJSONresponse(res, 500,{"message":"Unable to book tutor this time!"});
						return;
					}					
					//Setting awaiting availability
					//availableTutor.awaitingAvailability = schedule.scheduledTime;
					for (var i = 0; i < availableTutor.availability.length; i++) {
						if(availableTutor.availability[i].available == schedule.scheduledTime){
							availableTutor.availability[i].isawaiting = true;
						}
					}
					availableTutor.save(function(err){
						console.log("Updating awaitingAvailability");
						if(err){
							sendJSONresponse(res, 500,{"message":"inserting awaiting availability faild"});
							return;
						}
						sendJSONresponse(res, 200, {"message":"booked successfully"});
						//Sending Email to Tutor
						var subject = "One of student Looking For Tutoring"
						var content = "Hello "+availableTutor.firstName+' '+availableTutor.lastName+"\n\n We are pleased to inform you that your time slot of ( "+new Date(schedule.scheduledTime)+" ) for ( "+
						schedule.bookedFor+" ) has been booked. Can you please confirm on your account as soon as possible.\n\n Thanks for using instatutor!. \n\n Here's a message from the student you will assisting: \n Name:  "+
						student.firstName+' '+student.lastName+"\n Message From Student:  "+req.body.message;
						sendMail(availableTutor.email, subject, content);
					})
					
				})
			}
		})
	}else{
		sendJSONresponse(res, 404, {"message":"No student information"});
	}
}
// var putAwaitingAvailability = function(slotTime, callback){
// 	var tutor = req.tutor;
// 	tutor.awaitingAvailability = slotTime;
// }
var isTutoravalable = function(req,res, callback){
	console.log("checking for availability")
	if(req.body.tutorId){
		//Tutor.findOne({$and:[{'_id':ObjectId(req.body.tutorId)}, {'availability':{$in:[{available:req.body.slotTime, isawaiting:false}]}}]}, function(err, tutor){
		  Tutor.findOne({$and:[{'_id':ObjectId(req.body.tutorId)}, {'availability':{$elemMatch:{available:req.body.slotTime, isawaiting:false}}}]}, function(err, tutor){
			if(err){	
				return callback(err, null);;
			}else if(tutor == []){
				return callback(err, null);;
			}
			console.log(tutor);
			// if(tutor.awaitingAvailability !== 0 && tutor.awaitingAvailability == req.body.slotTime){
			// 	return callback(null, null);
			// }
			// for (var i = 0; i < tutor.availability.length; i++) {
			// 	if(tutor.availability[i].available == req.body.slotTime && tutor.availability[i].isawaiting == false){
			// 		callback(null,tutor);
			// 	}else{
			// 		callback(null, null);
			// 	}
			// }
			callback(null,tutor);
			
		})
	}else{
		sendJSONresponse(res, 404, {"message":"No Tutor information provided"});
		callback(null, null)
	}
}

exports.confirmTutoring = function(req, res){
	var student = req.student;
	if(student){
		var _id = req.body.scheduleId;
		var confirm = req.body.confirm;
		Schedules.findOneAndUpdate({'_id':ObjectId(_id)},
			{ $set: { "happen": confirm} },
    		{ upsert: false, safe:true }, function(err, schedule){
    			if(err){
    				sendJSONresponse(res, 500, {"message":"confirm tutoring faild"})
    				return;
    			}
    			sendJSONresponse(res, 200 , {"message":"confirmed"});
    		})

	}else{
		sendJSONresponse(res, 404, {"message":"student information not available"});
	}
}
//Not used function
exports.getRatingsForTutor = function(tutorId, callback){
	Rating.find({'_tutorId':tutor._id})
	.exec(function(err, rating){
		if(err){
			return callback(err, null);
		}else if(!rating || !rating.length ==0){
			return callback(new Error("No Ratings found"), null);
		}
		callback(err, rating);
	});
}
//Not used function
var getTutorInfo = function(tutor, callback){
	var info ={};

	info._id=tutor._id;
	info.firstName = tutor.firstName;
	info.lastName = tutor.lastName;
	info.grade = tutor.grade;
	info.email = tutor.email;
	info.availability = tutor.availability;
	info.subjects = tutor.subjects;
	info.ratings = tutor.ratings;
	info.enabled = tutor.enabled;
	info.needReset = tutor.needReset;
	info.created_at = tutor.created_at;
	info.updated_at = tutor.updated_at;

	return info;
}

exports.giveRating = function(req, res){
	var student = req.student;
	if(!student && student.token != ''){
		sendJSONresponse(res, 404, {"message":"No student Info"});
		return;
	}
	var tutor = req.body.tutorId;
	if(tutor){
		var rating = new Rating();
		rating._tutorId = tutor;
		rating._givenBy = student._id;
		//rating.rating = req.body.rating;//disabling rating as per requirement
		rating.review = req.body.review;
		rating.author.firstName = req.student.firstName;
		rating.author.lastName = req.student.lastName;
		rating.author.email = req.student.email;
		rating.save(function(err, newRating){
			if(err){
				sendJSONresponse(res, 403, {"message":"Not updated"});
			}else
			{
				Tutor.findOneAndUpdate(
					{'_id':newRating._tutorId},
					{ $push: { "ratings": newRating._id } },
    				{ upsert: false, safe:true }, function(err, tutor){
    					if(err){
    						sendJSONresponse(res, 500, {"message": "tutor update faild"});
    						return;
    					}
    					sendJSONresponse(res, 200, newRating);
    				})
			}
		})
	}else{
		sendJSONresponse(res, 400, {"message":"No tutor information"});
	}

}
exports.changePassword = function(req, res){
	var student = req.student;
	if(!student){
		sendJSONresponse(res, 404, {"message":"No student Info"});
		return;
	}
	var password = req.body.oldPassword;
	req.body.email = req.student.email;
	getStudentWithUserName(req, res, function(req, res, student){
		if(student.authenticate(password)){
			var newPassword = req.body.newPassword;
			student.setPassword(newPassword);
			student.needReset = false;
			student.token = undefined;
			student.save(function(err){
				if (err) {
					sendJSONresponse(res, 500, err);
					return
				}
			})
			sendJSONresponse(res, 200, {
				"message":"updated"
			});
			return
		}else{
			sendJSONresponse(res, 401, {"message":"password is invalid"});
		}	
	})	
}
exports.Login = function(req,res) {
	getStudentWithUserName(req, res, function(req, res, student) {
		var password = req.body.password
		if(!password || password.length < 1) {
			sendJSONresponse(res, 401, {
				"message": "Password invalid"
			});
			return
		}
		if(student.authenticate(password)) {
			console.log("authenticated")
			token = student.generateJwt();
			student.token = token
			student.save(function(err) {
				if (err) {
					sendJSONresponse(res, 500, err);
					return
				}
			});
			sendJSONresponse(res, 200, {
				"token" : token,
				"reset" : student.needReset,
				"displayName" : student.firstName+' '+student.lastName
			});
			return
		}
		else {
			sendJSONresponse(res, 401, {
				"message": "Password invalid"
			});
			return
		}
	})
}
exports.getById = function (studentId, callback) {
	console.log("Finding student with id " + studentId);
	if (studentId) {
		Student.findOne({ '_id' : ObjectId(studentId) },function(err, student) {
			if (err) {
				callback(err,null)
				return
			}
			else {
				if (!student) {
					callback(null, null)
					return
				}
			}
			callback(null, student);
			return
		});

	}
	else {
		callback(null, null)
	}
};

var getStudentWithUserName = function(req, res, callback) {
	console.log("Finding student with user name " + req.body.email);
	if (req.body.email) {
		Student.findOne({ 'email' : req.body.email })
		.exec(function(err, student) {
			if (!student) {
				sendJSONresponse(res, 404, {
					"message": "student not found"
				});
				return;
			} else if (err) {
				console.log(err);
				sendJSONresponse(res, 404, err);
				return;
			}
			console.log(student);
			callback(req, res, student);
		});

	} else {
		sendJSONresponse(res, 404, {
			"message": "student not found"
		});
		return;
	}

};
var sendMail = function(email, subject, content) {
	if(shouldSendMails) {
		var mailOptions = {
		    from: 'instatutorcontact@gmail.com', // sender address
		    to: email, // list of receivers
		    subject: subject, // Subject line
		    text: content //, // plaintext body
		}
	
		transporter.sendMail(mailOptions, function(error, info){
		    if(error){
		        console.log(error);
		    }else{
		        console.log('Message sent: ' + info.response);
		    }
		})
	}
}

var generatePassword = function() {
	password = passwordGenerator(10, false);
	console.log("password generated = "+password)
	return password
}

var sendJSONresponse = function(res, status, content) {
	res.status(status);
	res.json({ "status" : status,
		"content" : content
	});
};
