import Intro from './1.intro/';
import Twitter from './2.twitterbubbles/';


import FontFaceObserver from 'FontFaceObserver';
var font = new FontFaceObserver('lato');
let fontLoad = font.load();

// @todo all the other assets as well go here
// Smiles
// Cubetexture
// MSDF Font
// matcap
// videoframe
// video?
Promise.all([fontLoad])
  .then(responses => {
    // console.log('All assets are loaded');
    let twitter = new Twitter(() => {
      document.body.classList.add('is-loaded');
      // MAKE DELAY HERE BEFORE prese
      setTimeout(() => {
        Intro().then(() => {
          twitter.playTwitterPart().then(() => {
            alert('run video appear');
          });
        });
      }, 1500);
    });
    // $('.intro').hide();
    


    // Twitter().then(() => {
    // 	// after tweets gathered
    // 	alert('run final video appear');
    // });
  }) 
  .catch(error => {
    console.log(error);
  });


// start - intro TIMELINE


// init twitter stream at the end of timeline, run it for maximum 2 minutes or 100 tweets

// init triangles on the back



// callback to start finish TIMELINE
