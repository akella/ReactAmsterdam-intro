#pragma glslify: blendAdd = require(glsl-blend/add) 
// #pragma glslify: blendAverage = require(glsl-blend/average) 
// #pragma glslify: blendColorBurn = require(glsl-blend/color-burn) 
// #pragma glslify: blendColorDodge = require(glsl-blend/color-dodge) 
// #pragma glslify: blendDarken = require(glsl-blend/darken) 
// #pragma glslify: blendDifference = require(glsl-blend/difference) 
// #pragma glslify: blendExclusion = require(glsl-blend/exclusion) 
// #pragma glslify: blendGlow = require(glsl-blend/glow) 
// #pragma glslify: blendHardLight = require(glsl-blend/hard-light) 
// #pragma glslify: blendHardMix = require(glsl-blend/hard-mix) 
// #pragma glslify: blendLighten = require(glsl-blend/lighten) 
// #pragma glslify: blendLinearBurn = require(glsl-blend/linear-burn) 
// #pragma glslify: blendLinearDodge = require(glsl-blend/linear-dodge) 
// #pragma glslify: blendLinearLight = require(glsl-blend/linear-light) 
// #pragma glslify: blendMultiply = require(glsl-blend/multiply) 
// #pragma glslify: blendNegation = require(glsl-blend/negation) 
// #pragma glslify: blendNormal = require(glsl-blend/normal) 
// #pragma glslify: blendOverlay = require(glsl-blend/overlay) 
// #pragma glslify: blendPhoenix = require(glsl-blend/phoenix) 
// #pragma glslify: blendPinLight = require(glsl-blend/pin-light) 
// #pragma glslify: blendReflect = require(glsl-blend/reflect) 
// #pragma glslify: blendScreen = require(glsl-blend/screen) 
// #pragma glslify: blendSoftLight = require(glsl-blend/soft-light) 
// #pragma glslify: blendSubtract = require(glsl-blend/subtract) 
// #pragma glslify: blendVividLight = require(glsl-blend/vivid-light) 

float contrast(float mValue, float mScale, float mMidPoint) {
  return clamp( (mValue - mMidPoint) * mScale + mMidPoint, 0.0, 1.0);
}

float contrast(float mValue, float mScale) {
  return contrast(mValue,  mScale, .5);
}

vec2 contrast(vec2 mValue, float mScale, float mMidPoint) {
  return vec2( contrast(mValue.r, mScale, mMidPoint), contrast(mValue.g, mScale, mMidPoint) );
}

vec2 contrast(vec2 mValue, float mScale) {
  return contrast(mValue, mScale, .5);
}
  
vec3 contrast(vec3 mValue, float mScale, float mMidPoint) {
  return vec3( contrast(mValue.r, mScale, mMidPoint), contrast(mValue.g, mScale, mMidPoint), contrast(mValue.b, mScale, mMidPoint) );
}

vec3 contrast(vec3 mValue, float mScale) {
  return contrast(mValue, mScale, .5);
}

uniform samplerCube tCube;
uniform sampler2D tMatCap;
uniform float startProgress;
varying vec3 vReflect;
varying vec3 vRefract[3];
varying float vReflectionFactor;

varying vec3 eye;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {



	// matcap calc
	vec3 r = reflect( eye, vNormal );
	float m = 2. * sqrt( pow( r.x, 2. ) + pow( r.y, 2. ) + pow( r.z + 1., 2. ) );
	vec2 vN = r.xy / m + .5;
	vec3 base = texture2D( tMatCap, vN ).rgb;
	// end matcap


	// fresnel = reflect + refract
	vec4 reflectedColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );
	vec4 refractedColor = vec4( 1.0 );
	refractedColor.r = textureCube( tCube, vec3( -vRefract[0].x, vRefract[0].yz ) ).r;
	refractedColor.g = textureCube( tCube, vec3( -vRefract[1].x, vRefract[1].yz ) ).g;
	refractedColor.b = textureCube( tCube, vec3( -vRefract[2].x, vRefract[2].yz ) ).b;
	gl_FragColor = mix( refractedColor, reflectedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );
	gl_FragColor = vec4(gl_FragColor.rgb*vec3(0.894, 0.918, 0.944),vReflectionFactor);

	// end fresnel


	// vignette on edge
	vec3 nf                 = normalize(vec3(-.1, -.25, -1.0));
	float angle             = smoothstep(0.0, 1.0, dot(vNormal, nf));

	reflectedColor.rgb -= (1. - vec3(angle))*0.2;
	// vignette on edge


	// gl_FragColor = vec4(gl_FragColor.rgb*vec3(0.894, 0.918, 0.944),0.6);
	// gl_FragColor = vec4(gl_FragColor.rgb*vec3(0.894, 0.918, 0.944),0.);
	vec3 blend = blendAdd(reflectedColor.rgb, base);
	gl_FragColor = vec4(blend,gl_FragColor.a*startProgress);
	// gl_FragColor = vec4(base,1.);
	// gl_FragColor = vec4(base,1.);
	// gl_FragColor = vec4(vNormal,1.);
	// gl_FragColor = vec4(vec3(angle),1.);
	// gl_FragColor = refractedColor;
}