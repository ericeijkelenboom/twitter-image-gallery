var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var twitter = require('ntwitter');
var io = require('socket.io');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
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
    socket.emit('data', {});
});

// Create twitter client
var t = new twitter({
    consumer_key: 'l16oNBsc4vTv9wORAICk8A',
    consumer_secret: 'Kt2lMGK5DPRGHc6v4mwOGEYrQMiY2x88IidBTgHKHk', 
    access_token_key: '340823351-o20nfo4pHFRgWGW6mKo7dA2GnkJo8iDNfVYfKKOG',
    access_token_secret: 'F6oIfYF33ZsOIGp396gvOSj33kbfh6Lusyc8lLITPN3na'
});

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
