import io from 'socket.io-client';
import Bubbles from './bubbles';
import * as dat from 'dat.gui';
import {Howl, Howler} from 'howler';

const bgSound = new Howl({
  src: ['sounds/bg.mp3'],
  volume: 0.3,
  loop: true
});

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
    bgSound.play();
    this.randomNames = [
      'pixelscommander',
      'operatino',
      'akella',
      'loveiko',
      'okonetchnikov',
      'denysdovhan',
      'thekitze',
      'pauloportella_',
      'ReactAmsterdam',
      'TejasKumar_',
      'CrystallizeAPI',
      'grabbou',
      'ivanbuncic',
      'iamsapegin',
      'carlbergenhem',
      'cvaneenige',
      'deutschevita',
      'briljantmartijn',
      '4nduril',
      'httpJunkie',
      'elibelly',
      'blv_dmitry',
      'danielbayerlein',
      'kentcdodds',
      'ManuelBieh',
      'pixelscommander',
      'operatino',
      'akella',
      'loveiko',
      'okonetchnikov',
      'denysdovhan',
      'thekitze',
      'pauloportella_',
      'ReactAmsterdam',
      'TejasKumar_',
      'CrystallizeAPI',
      'grabbou',
      'ivanbuncic',
      'iamsapegin',
      'carlbergenhem',
      'cvaneenige',
      'deutschevita',
      'briljantmartijn',
      '4nduril',
      'httpJunkie',
      'elibelly',
      'blv_dmitry',
      'danielbayerlein',
      'kentcdodds',
      'ManuelBieh',
    ];
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

    // this.gui = new dat.GUI();
    // this.gui.add(this.settings, 'startProgress', 0,1, 0.01);
    // this.gui.add(this.settings, 'addTweet');
    // this.gui.add(this.settings, 'Punch');
  }

  addTweet() {
    

    // let random = Math.floor(randomNames.length*Math.random());
    let random = this.randomNames.shift();

    this.bb.addNewBubble('@'+random);
    this.current++;
  }

  playTwitterPart() {
    let that = this;
    return new Promise(function(resolve) {
      that.bb.play();
      setTimeout(() => {that.bb.animateFirst();},1000);
      that.bb.onFinish = () => {
        // bgSound.fade(0.3,0,1000);
        bgSound.stop();
        that.bb.stopTwitterIntegration();
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

      
      document.body.onkeyup = function(e) {
        if(e.keyCode === 32) {
          
          if(that.bb.twitteranimated) {
            that.addTweet();
          }
        }
      };
      
      
      // prepare wall
      // prepare bubbles
      // run appearing globe with fixed @twitter handle

      // at the end, run socket listener

      // let socket = io('http://localhost:5000'); // Change to the host and node port
      let socket = io('https://salty-woodland-56743.herokuapp.com'); // Change to the host and node port
      socket.emit('hash', {hash:'ReactAmsterdam'});
      console.log('connecting');
      socket.on('stream', function(tweet) {
        // TWEET HAPPENED
        if(that.bb.twitteranimated) {
          that.bb.addNewBubble('@'+tweet.username);
        }
        
        console.log('tweet',tweet.name, tweet.username);
    
      });


    });
  }
  
}


