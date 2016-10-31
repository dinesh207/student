
var express = require('express'); // call express
var app = express(); // define our app using express
var router = express.Router();
var bodyParser = require('body-parser'); // for reading post body
var cors = require('cors')
var jwt = require('jsonwebtoken')
// var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

// var config = require ('./config.json');
// var CONFIG_PREFIX = "production";
// if ( process.env.CONFIG_PREFIX != undefined )
// 	CONFIG_PREFIX = process.env.CONFIG_PREFIX;
// console.log("CONFIG_PREFIX="+CONFIG_PREFIX)
// config = config[CONFIG_PREFIX]

/*******************************************************************************
 * When request header type is set to "JSON" then form won't work.
 ******************************************************************************/
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({
	extended : true
})); // for parsing application/x-www-form-urlencoded
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.text());

process.on('uncaughtException', function(err) {
	console.log('Caught exception: ' + err);
});
var MongoHandler = require('./db/mongoHandler');
var db = require('./lib/db');

var url = 'mongodb://localhost/myDB';
if(process.env.MONGOLAB_URI !== undefined){
	url = process.env.MONGOLAB_URI;
}

// process.stdout.write('${url}\n');
MongoHandler.initialize(url, app);
db.init(url);

// loading static files
app.use(express.static('public'));
app.use(function(req, res, next) {

	var requestType = req.get('content-type');
	//console.log(requestType)
	if (requestType && requestType.substring(0,10) == 'text/plain') {// could be text/plain;charset=ISO-8859-1
		console.log("content type is text")
		console.log("body = " + req.body)
		req.body = JSON.parse(req.body);
		console.log("body = " + JSON.stringify(req.body))
	}

	// Website you wish to allow to connect
	console.log("setting access control allow for:" + process.env.NODE_ENV)
	res.setHeader('Access-Control-Allow-Origin', '*');
	if (process.env.NODE_ENV == 'development') { 
		console.log("WARN - setting access control allow")
		res.setHeader('Access-Control-Allow-Origin', '*');
	}
	// Request methods you wish to allow
	res.setHeader('Access-Control-Allow-Methods',
			'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	// Request headers you wish to allow
	res.setHeader('Access-Control-Allow-Headers',
			'X-Requested-With,content-type');
	// Set to true if you need the website to include cookies in the requests
	// sent
	// to the API (e.g. in case you use sessions)
	res.setHeader('Access-Control-Allow-Credentials', true);
	// Pass to next layer of middleware
	next();
});

var studentRoute = require('./routes/student');
var tutorRoute = require('./routes/tutor');
var commentsRoute = require('./routes/comments');

app.use('/student', studentRoute.VerifyToken);
app.get('/student/findTutors/:subject', studentRoute.findTutors);
app.post('/student/changePassword', studentRoute.changePassword);
app.post('/student/tutorRating', studentRoute.giveRating);
app.post('/student/bookTutor', studentRoute.bookTutor);
app.get('/student/getUpcomingSchedules', studentRoute.upcomingSchedules);
app.post('/student/confirmTutoring', studentRoute.confirmTutoring);

app.use('/tutor', tutorRoute.VerifyToken);
app.get('/tutor/getAvailability', tutorRoute.getTutorAvailability);
app.post('/tutor/updateAvailability', tutorRoute.updateAvailability);
app.post('/tutor/changePassword', tutorRoute.changePassword);
app.get('/tutor/getUpcomingSchedules', tutorRoute.upcomingSchedules);
app.post('/tutor/removeAvailability', tutorRoute.removeAvailability);
app.get('/tutor/schedulesToConfirm',tutorRoute.getSchedulesToConfirm);
app.post('/tutor/confirmBooking', tutorRoute.confirmBooking);

app.post('/comment', commentsRoute.creatComment);
app.post('/reply', commentsRoute.creatReply);
//app.get('/comments', commentsRoute.getComments);

router.post('/register/student', studentRoute.Create);
router.post('/login/student', studentRoute.Login);
router.post('/register/tutor', tutorRoute.createTutor);
router.post('/login/tutor', tutorRoute.Login);
app.use('/api', router);



