// dependencies
var express = require('express');
var mongoose = require('mongoose');

// global config
var app = express();
var PORT = process.env.PORT || 3000;
var MONGO_DB = process.env.MONGO_DB;
/*var http = require('http').Server(app);
var io = require('socket.io')(http);*/

app.use('/assets', express.static(__dirname + '/assets'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(require('body-parser').urlencoded({ extended: true }));

mongoose.Promise = global.Promise;
mongoose.connect(MONGO_DB);

// run server
var server = app.listen(PORT);
var io = require('socket.io')(server);

require('./routes/routes')(app, io);

