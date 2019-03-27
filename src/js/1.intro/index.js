const charming = require('charming');
import {TimelineMax} from 'gsap';

export default function Intro() {

  return new Promise(function(resolve) {

  // Set up vars
    let texts = [];
    let tl = new TimelineMax({onComplete: resolve});
    let animTime = 0.9; // baseline animation time for each stagger
    let delay = 0.05;
    const width = window.innerWidth; // viewport width
    const height = window.innerHeight; // viewport height
    let depth = -width/8; // rotation depth based on viewport width
    let tOrigin = '50% 50% '+depth; // transform origin as a factor of viewport width to allow for different device widths

    const elements = [...document.querySelectorAll('.intro div')];
    elements.forEach(e => {
      charming(e);
      texts.push([...e.querySelectorAll('span')]);
    });
    tl.set(elements, { perspective:700, transformStyle:'preserve-3d'});
    tl.set('.animatedtext',{opacity:1});
    let dedelay = undefined;
    texts.forEach((t,i) => {
    	// ease: Back.easeOut.config(1.7)
      if(i===texts.length-1) {dedelay = '-=1.2';} else{dedelay = undefined;}
	  	tl.staggerFromTo(t, animTime, { rotationX: -90,opacity:0 }, { rotationX: 0, transformOrigin: tOrigin,opacity:1 }, delay,dedelay);
	  	tl.staggerTo(t, animTime*1.2, { rotationX: 45, transformOrigin: tOrigin,opacity:0,ease: Power2.easeOut }, delay/2);
    });
  
  });

}
