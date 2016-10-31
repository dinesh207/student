require('./student')
require('./tutor')
require('./rating')
require('./availability')
require('./schedules')
require('./comments')
var mongoose = require('mongoose');
var dbURI = 'mongodb://localhost/local';
/*if (process.env.NODE_ENV === 'production') {
    dbURI = process.env.MONGOLAB_URI;
}*/

exports.init = function(url) {
	dbURI = url
	mongoose.connect(url);
	if (process.env.NODE_ENV === 'development') {
		mongoose.set('debug', true);
	}
}




// CONNECTION EVENTS
mongoose.connection.on('connected', function() {
    console.log('Mongoose connected to ' + dbURI);
});
mongoose.connection.on('error', function(err) {
    console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function() {
    console.log('Mongoose disconnected');
});
