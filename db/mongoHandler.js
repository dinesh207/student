var MongoClient = require ('mongodb').MongoClient;
var ObjectID = require ('mongodb').ObjectID;
var jwt = require('jsonwebtoken');
var assert = require('assert');
var DBName = 'User';


var mongoconnection;
var port = process.env.PORT || 8080;
module.exports = {
	initialize: function (_url, app) {
		//DBUrl = _url;
		
		 console.log('Opening mongo connection on: ' + _url);
		
		//Initialize connection once
		MongoClient.connect(_url, function(err, database) {
		  if(err) 
			  throw err;

		  mongoconnection = database;
		  app.locals.db = database;

		  // Start the application after the database connection is ready
		  app.listen(port);
		  console.log('Listening on: ' + port);

		});
	}
}