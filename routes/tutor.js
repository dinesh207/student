var express = require('express');
var ObjectId = require ('mongodb').ObjectID;
var mongoose = require('mongoose');
var passwordGenerator = require("password-generator");
var Tutor = mongoose.model('Tutor');
var Schedules = mongoose.model('Schedules');
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer')
var validator = require('validator')

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

exports.createTutor = function(req, res) {
	var tutor = new Tutor()
	var email = req.body.email
	if(email && validator.isEmail(email)) {
		Tutor.findOne({ 'email' : email })
		.exec(function(err, presentTutor) {
			if (presentTutor) {
				sendJSONresponse(res, 409, {
					"message": "Tutor with requested email already found"
				});
				return;
			} else if (err) {
				console.log(err);
				sendJSONresponse(res, 500, err);
				return;
			}
			tutor.email = req.body.email
			//var pass = generatePassword() //for now disabling one time password
			//tutor.setPassword(pass)
			tutor.setPassword(req.body.password)
			tutor.enabled = true
			tutor.needReset = true
			tutor.firstName = req.body.firstname
			tutor.lastName = req.body.lastname
			tutor.grade = req.body.grade
			tutor.subjects = req.body.subjects
			tutor.availability = req.body.availability
			tutor.save(function(err, tutor) {
				if (err) {
					sendJSONresponse(res, 500, err);
					return
				} else {
					sendJSONresponse(res, 200, {
						"message": "OK"
					});
					//send mail
					var subject = "Thank you for using Instatutor!"
					var content = "Dear "+tutor.firstName+' '+tutor.lastName+"\n\n We are looking forward to helping you connect to students in need of your expertise. "+
					 "You may update your availability anytime you would like and you may select as many available times as you can. "+ 
					 "Your username is ( "+tutor.email+" ) and your password is ( "+req.body.password+" ) We hope that you enjoy our services!"
					sendMail(tutor.email, subject, content)
					return
				}
			});
		})
	}
	else {
		sendJSONresponse(res, 404, {
			"message": "tutor username or email not found or not valid format in request"
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
	Tutor.verifyJwt(token, function(error, flag) {
		if(error) {
			sendJSONresponse(res, 403,error);
			return
		}
		var decoded = jwt.verify(token, process.env.JWT_SECRET)
		module.exports.getById(decoded._id, function (err, tutor) {
			if(err) {
				sendJSONresponse(res, 403,error);
				return
			}
			if(tutor) {
				req.tutor = tutor
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
					"message": "Tutor not present"
				});
				return
			}
		})

	})
}
//Get Availability
exports.getTutorAvailability = function(req, res){
	var tutor = req.tutor;
	if(!tutor){
		sendJSONresponse(res, 404, {"message":"Tutor is not registerd"});
		return
	}
	sendJSONresponse(res, 200, tutor.availability);
}
//Get schdules to confirm
exports.getSchedulesToConfirm = function(req, res){
	var tutor = req.tutor;
	if(!tutor){
		sendJSONresponse(res, 404, {"message":"Tutor is not registerd yet"});
		return;
	}
	Schedules.find({'_bookedTutor':ObjectId(req.tutor._id),'happen':false, 'tutorConfirm':false,'rejectSchdule':false})
		.populate({path:'_bookedBy', select:'firstName lastName email' })
		.exec(function(err, schedules){
			if(err){
				sendJSONresponse(res, 500, {"message":"getting schedules error"});
				return;
			}
			sendJSONresponse(res, 200, schedules);
		})
}
//Confirm Booking
exports.confirmBooking = function(req, res){
	var tutor = req.tutor;
	if(!tutor){
		sendJSONresponse(res, 404, {"message":"Tutor is not registerd yet"});
		return;
	}
	var confirm = req.body.confirmBooking;
	var toReject = req.body.rejectBooking;
	var scheduleId = req.body.id;
	var studentName = req.body.studentName;
	var email = req.body.studentEmail;
	Schedules.findOneAndUpdate({'_id':ObjectId(scheduleId)},
		{$set:{'tutorConfirm':confirm, 'rejectSchdule':toReject}}, function(err, schedule){
			if(err){
				sendJSONresponse(res, 500, {"message":"confirmation is failed"});
				return;
			}
			updateTutorAvailability(req, res, schedule.scheduledTime, function(err, tutor){
				if(err){
					sendJSONresponse(res, 500, {"message":"removing update is failed"});
					return;
				}
				sendJSONresponse(res, 200, schedule);
				if(confirm){
					var subject = "Appointment confirmation from tutor";
					var content = "Hello "+studentName+"\n\n Your appointment for ( "+new Date(schedule.scheduledTime)+" ) for ( "+
					schedule.bookedFor+" ) Your tutor looks forward to meeting you or (please email this tutor if you would like to request a different time.) \n Tutor Email: "+tutor.email;
				}else{
					var subject = "Your recent Appointment is rejected from tutor";
					var content = "Hello "+studentName+"\n\n Your appointment for ( "+new Date(schedule.scheduledTime)+" ) for ( "+
					schedule.bookedFor+" ) is rejected by the tutor. (please email this tutor if you would like to request a different time.) \n Tutor Email: "+tutor.email;
				}			
				sendMail(email, subject, content);
			})	
		})
}
//Update availability once confirmed: TODO remove findOne query
var updateTutorAvailability = function(req, res,slot ,callback){
	var tutor = req.tutor;
	if(!tutor){
		sendJSONresponse(res, 500, {"message":"No tutor Id present"})
		callback(null);
		return;
	}	
	for(var i =0; i<tutor.availability.length; i++){
		if(tutor.availability[i].available == slot){
			if(req.body.confirmBooking){
				tutor.availability.splice(i, 1);
			}else{
				tutor.availability[i].isawaiting = false;
			}
		}
	}
	tutor.save(function(err, newTutor){
		if(err){
			sendJSONresponse(res, 500,{"message":"updating slot tutor is faild"});
			callback(err,null);
			return;
		}
		callback(null,newTutor);
	})
}
//Get upcoming schedules
exports.upcomingSchedules = function(req, res){
	var tutor = req.tutor;
	if(tutor){
		Schedules.find({'_bookedTutor':ObjectId(req.tutor._id),'happen':false,'tutorConfirm':true})
		.populate({path:'_bookedBy', select:'firstName lastName email' })
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
//Update tutor availability
exports.updateAvailability = function(req, res){
	var tutor = req.tutor;
	if(!tutor){
		sendJSONresponse(res, 404, {"message":"Tutor is not registerd"});
		return
	}
	var availability = req.body.availability;
	for (var i = 0; i < availability.length; i++) {
		tutor.availability.push(availability[i]);
	}
	tutor.save(function(err, updatedTutor){
		if(err){
			sendJSONresponse(res, 500, {"message":"update availability failed"});
			return;
		}
		sendJSONresponse(res, 200, updatedTutor);
	})
}
//Remove Availability
exports.removeAvailability = function(req, res){
	var tutor = req.tutor;
	if(!tutor){
		sendJSONresponse(res, 404,{"message":"Tutor is not registerd"});
	}
	var availability = req.body.removeAvailability;
	if(tutor.availability.length>0){
		for (var i = 0; i < tutor.availability.length; i++) {
			if(tutor.availability[i].available ==  availability.available){
				tutor.availability.splice(i,1);
			}
		}
		tutor.save(function(err, tutor){
			if(err){
				sendJSONresponse(res, 500, {"message":"Removing availability failed"});
				return;
			}
			sendJSONresponse(res,200, tutor);
		})
	}
}
exports.changePassword = function(req, res){
	var tutor = req.tutor;
	if(!tutor){
		sendJSONresponse(res, 404, {"message":"No tutor Info"});
		return;
	}
	var password = req.body.oldPassword;
	req.body.email = req.tutor.email;
	getTutorWithUserName(req, res, function(req, res, tutor){
		if(tutor.authenticate(password)){
			var newPassword = req.body.newPassword;
			tutor.setPassword(newPassword);
			tutor.needReset = false;
			tutor.token = undefined;
			tutor.save(function(err){
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
exports.getById = function (tutorId, callback) {
	console.log("Finding tutor with id " + tutorId);
	if (tutorId) {
		Tutor.findOne({ '_id' : ObjectId(tutorId) },function(err, tutor) {
			if (err) {
				callback(err,null)
				return
			}
			else {
				if (!tutor) {
					callback(null, null)
					return
				}
			}
			callback(null, tutor);
			return
		});

	}
	else {
		callback(null, null)
	}
};

exports.Login = function(req,res) {
	getTutorWithUserName(req, res, function(req, res, tutor) {
		var password = req.body.password
		if(!password || password.length < 1) {
			sendJSONresponse(res, 401, {
				"message": "Password invalid"
			});
			return
		}
		if(tutor.authenticate(password)) {
			console.log("Tutor authenticated")
			token = tutor.generateJwt();
			tutor.token = token
			tutor.save(function(err) {
				if (err) {
					sendJSONresponse(res, 500, err);
					return
				}
			});
			sendJSONresponse(res, 200, {
				"token" : token,
				"reset" : tutor.needReset,
				"displayName" : tutor.firstName+' '+tutor.lastName
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
var getTutorWithUserName = function(req, res, callback) {
	console.log("Finding tutor with user name " + req.body.email);
	if (req.body.email) {
		Tutor.findOne({ 'email' : req.body.email })
		.exec(function(err, tutor) {
			if (!tutor) {
				sendJSONresponse(res, 404, {
					"message": "tutor not found"
				});
				return;
			} else if (err) {
				console.log(err);
				sendJSONresponse(res, 404, err);
				return;
			}
			console.log(tutor);
			callback(req, res, tutor);
		});

	} else {
		sendJSONresponse(res, 404, {
			"message": "tutor not found"
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
