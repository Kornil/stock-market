// dependencies
var express = require('express');
var mongoose = require('mongoose');

// global config
var app = express();
var PORT = process.env.PORT || 3000;
var MONGO_DB = process.env.MONGO_DB;

app.use('/assets', express.static(__dirname + '/assets'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(require('body-parser').urlencoded({ extended: true }));

mongoose.Promise = global.Promise;
mongoose.connect(MONGO_DB);

require('./routes/routes')(app);

// run server
app.listen(PORT);