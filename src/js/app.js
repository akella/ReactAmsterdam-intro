import Intro from './1.intro/';
import Twitter from './2.twitterbubbles/';


import FontFaceObserver from 'FontFaceObserver';
var font = new FontFaceObserver('lato');
let fontLoad = font.load();

// @todo all the other assets as well go here
Promise.all([fontLoad])
  .then(responses => {
    console.log('All assets are loaded');

    Intro().then(() => {
    	// Twitter().then(() => {
    	// 	alert('run video appear');
    	// });
    });


    Twitter().then(() => {
    	// after tweets gathered
    	alert('run final video appear');
    });
  }) 
  .catch(error => {
    console.log(error);
  });


// start - intro TIMELINE


// init twitter stream at the end of timeline, run it for maximum 2 minutes or 100 tweets

// init triangles on the back



// callback to start finish TIMELINE
