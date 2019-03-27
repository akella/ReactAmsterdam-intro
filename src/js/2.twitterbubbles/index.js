import io from 'socket.io-client';
import Bubbles from './bubbles';
import * as dat from 'dat.gui';


export default class twitterbubbles {
  constructor(callback) {
    this.max = 10;
    this.current;
    this.settings();
    this.bb = new Bubbles(
      'container',
    );
    this.bb.initiate(() => {
      this.bb.settings.startProgress = 1;
      callback();
    });
  }

  settings() {
    let that = this;
    this.settings = {
      addTweet: () => {
        this.addTweet();
      },
      Punch: () => {
        this.bb.punchWall(new THREE.Vector3(0,0,that.z));
      }
    };

    this.gui = new dat.GUI();
    // this.gui.add(this.settings, 'startProgress', 0,1, 0.01);
    this.gui.add(this.settings, 'addTweet');
    this.gui.add(this.settings, 'Punch');
  }

  addTweet() {
    this.bb.addNewBubble();
    this.current++;
  }

  playTwitterPart() {
    let that = this;
    return new Promise(function(resolve) {
      that.bb.play();
      setTimeout(() => {that.bb.animateFirst();},1000);
      that.bb.onFinish = () => {
        that.bb.runVideo();
        resolve();
      };
      // console.log( resolve, that.bb.onFinish,'API');
      // let bb = new Bubbles(
      //   'container',
      // );
      // bb.initiate(() => {
      //   bb.play();
      //   bb.settings.startProgress = 1;
      // });
      
      
      // prepare wall
      // prepare bubbles
      // run appearing globe with fixed @twitter handle

      // at the end, run socket listener

      let socket = io('http://localhost:5000'); // Change to the host and node port
      socket.emit('hash', {hash:'saturdaymorning'});

      socket.on('stream', function(tweet) {
        // TWEET HAPPENED
        console.log('tweet',tweet.name, tweet.username);
        // addBubble here;
      });


      // when we have enough drops
      // resolve();
    });
  }
  
}


