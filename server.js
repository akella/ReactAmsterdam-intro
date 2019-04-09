var nconf = require('nconf');
var Twit = require('twit');
var _ = require('lodash');

const app = require('express')();
const server = require('http').createServer(app);
var io = require('socket.io').listen(server);
server.listen(5000);


nconf.file({ file: 'twitter-config.json' }).env();

var twitter = new Twit({
  consumer_key: nconf.get('TWITTER_CONSUMER_KEY'),
  consumer_secret: nconf.get('TWITTER_CONSUMER_SECRET'),
  access_token: nconf.get('TWITTER_ACCESS_TOKEN'),
  access_token_secret: nconf.get('TWITTER_ACCESS_TOKEN_SECRET')
});


// attach to stream using trends as track parameters
// var tweetStream = twitter.stream('statuses/filter', { track: 'saturdaymorning' });

io.sockets.on('connection', function (socket) {
  console.log('Socket.io connected');

  socket.on('hash', function(hash){
    var streamHash = hash.hash;
    var stream = twitter.stream('statuses/filter', { track: streamHash });
    console.log('hash connected:' + streamHash);
    stream.on('tweet', function (tweet) {
    	console.log('---');
    	console.log('screen_name:', tweet.user.screen_name);
    	console.log('text:', tweet.text);
      io.sockets.emit('stream', {
      	text:tweet.text, 
      	name:tweet.user.name, 
      	username:tweet.user.screen_name, 
      	icon:tweet.user.profile_image_url, 
      	hash:streamHash});
    });
  });
});


// on tweet
// tweetStream.on('tweet', function (tweet) {
//   console.log('---');
//   console.log('screen_name:', tweet.user.screen_name);
//   console.log('text:', tweet.text);
// });
