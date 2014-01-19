var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var twitter = require('ntwitter');
var io = require('socket.io');
var fs    = require('fs');

// Setup configuration
var nconf = require('nconf');
nconf.argv()
      .env()
      .file({ file: 'config.json' });

var app = express();

app.set('port', nconf.get('http_port') || process.env.PORT);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res){
  res.render('index', { data: "" });
});

app.get('/filter', function(req, res) {
  var filter = req.query.q;
  track(filter);
  res.send({filter: filter});
});

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

//Start a connection
var sockets = io.listen(server);

sockets.sockets.on('connection', function(socket) { 
    console.log('Initial socket data');
    socket.emit('data', {});
});

console.log('Creating twitter ' + nconf.get('twitter_consumer_key'));

// Create twitter client
var t = new twitter({
    consumer_key: nconf.get('twitter_consumer_key'),
    consumer_secret: nconf.get('twitter_consumer_secret'), 
    access_token_key: nconf.get('twitter_access_token_key'),
    access_token_secret: nconf.get('twitter_access_token_secret')
});

console.log('Twitter created');

var stream;

// Start streaming
var track = function(filter) {
  console.log('FILTER RECEIVED ' + filter);

  stream = t.stream('statuses/filter', { track: filter + ' photo' }, function(stream) {
	  stream.on('data', function(tweet) {
		if(tweet.disconnect) return;

		var media = tweet.entities["media"];
		if(!media) return;

		var media_url = media[0]["media_url"];
		if(!media_url) return;

		sockets.sockets.emit('data', {text: tweet.text, url: media_url}); 
	  });
	});
}
