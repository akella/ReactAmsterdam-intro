// import * as THREE from 'three';

import {
  SphereBufferGeometry,
  SphereGeometry
} from 'three/src/geometries/SphereGeometry';
import { Vector3 } from 'three/src/math/Vector3';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';

import fragment from './fragment.glsl';
import vertex from './vertex.glsl';

let geometry = new SphereBufferGeometry( 1, 64, 32 );
geometry = new SphereBufferGeometry( 1, 64, 64 );
// geometry = new THREE.SphereBufferGeometry( 1, 32, 32 );
// geometry = new THREE.SphereBufferGeometry( 1, 48, 48 );

// uniforms
let wTime = [];
let wHeight = [];
let wLength = [];
let wPosition = [];

for (let i = 0; i < 10; i++) {
  wTime.push(0);
  wLength.push(0);
  wLength.push(0);
  wPosition.push(new Vector3(0,0,0));
}



let uniforms = {

  'startProgress': { value: 0.0 },
  'scaleMain': { value: 0.0 },
  'noiseScale': { value: 0.0 },

  'wTime': { type: 'fv1', value: wTime },
  'wHeight': { type: 'fv1',value: wHeight },
  'wLength': { type: 'fv1', value: wLength},
  'wPosition': { type: 'v3v', value: wPosition },

  'mRefractionRatio': { value: 1.02 },
  'mFresnelBias': { value: 0.1 },
  'mFresnelPower': { value: 2.0 },
  'mFresnelScale': { value: 1.0 },
  'time': { value: 1.0 },
  'tCube': { value: null },
  'tMatCap': { value: null },
};

// uniforms[ "tCube" ].value = textureCube;
uniforms[ 'mRefractionRatio' ].value = 0.1;


let material = new ShaderMaterial( {
  extensions: {
	    derivatives: '#extension GL_OES_standard_derivatives : enable',
  },
  uniforms: uniforms,
  vertexShader: vertex,
  fragmentShader: fragment,
  // wireframe: true,
  opacity: 1,
  transparent: true,
  // flatshading: false,
  // depthTest: false
} );

// let mesh = new THREE.Mesh( geometry, material );
// mesh.scale.x = mesh.scale.y = mesh.scale.z =  1;


export default {
  material: material,
  geometry: geometry
};
