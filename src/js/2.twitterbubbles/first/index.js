const charming = require('charming');
import {TimelineMax} from 'gsap';

export default function Intro() {



  // Set up vars
  let texts = [];
  let tl = new TimelineMax();
  let animTime = 0.9; // baseline animation time for each stagger
  let delay = 0.05;

  const width = window.innerWidth; // viewport width
  const height = window.innerHeight; // viewport height
  let depth = -width/8; // rotation depth based on viewport width
  let tOrigin = '50% 50% '+depth; // transform origin as a factor of viewport width to allow for different device widths

  const elements = [...document.querySelectorAll('.firsttweet div')];
  function pause() {
    tl.pause();  
  }  
  elements.forEach(e => {
    charming(e);
    texts.push([...e.querySelectorAll('span')]);
  });
  tl.set(elements, { perspective:700, transformStyle:'preserve-3d'});


  tl.staggerFromTo(texts[0], animTime, { rotationX: -90}, { rotationX: 90, transformOrigin: tOrigin, },delay);
  tl.staggerFromTo(texts[1], animTime, { rotationX: -90}, { rotationX: 90, transformOrigin: tOrigin, },delay,animTime/2);
  tl.staggerFromTo(texts[2], animTime, { rotationX: -90}, { rotationX: 90, transformOrigin: tOrigin, },delay,animTime);
  tl.staggerFromTo(texts[3], animTime, { rotationX: -90}, { rotationX: 0, transformOrigin: tOrigin, },delay,animTime*1.5);
  // tl.add(pause);


  let tl2 = new TimelineMax();
  tl2.staggerTo(texts[3], animTime, { rotationX: 90, transformOrigin: tOrigin, },delay);

  tl2.pause();
  tl.pause();

  return {show: tl, hide: tl2};
  


}
