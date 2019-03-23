import io from 'socket.io-client';
import Bubbles from './bubbles';

export default function twitterbubbles() {

  return new Promise(function(resolve) {

    let bb = new Bubbles('container');
    bb.initiate(() => {
    	bb.play();
    	bb.settings.startProgress = 1;
    });
    
    
  	// prepare wall
  	// prepare bubbles
  	// run appearing globe with fixed @twitter handle

  	// at the end, run socket listener

  	let socket = io('http://localhost:5000'); // Change to the host and node port
  	socket.emit('hash', {hash:'saturdaymorning'});

  	 socket.on('stream', function(tweet) {
  	 	// TWEET HAPPENED
  	 	console.log('tweet',tweet.name, tweet.username);
  	 	// addBubble;
  	 });





    // when we have enough drops
    // resolve();
  });
}


