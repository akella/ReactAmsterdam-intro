#pragma glslify: blendAdd = require(glsl-blend/add) 


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
uniform sampler2D tSmile;
uniform sampler2D tSmile1;
uniform sampler2D tSmile2;
uniform sampler2D tSmile3;
uniform float smileProgress;
uniform float startProgress;
varying vec3 vReflect;
varying vec3 vRefract[3];
varying float vReflectionFactor;

varying vec3 eye;
varying vec3 vNormal;
varying vec3 vPosition;
varying float visible;
varying vec2 vUv;
varying float smile;

void main() {

	
	

	if(visible<0.5) discard;
	// matcap calc
	vec3 r = reflect( eye, vNormal );
	float m = 2. * sqrt( pow( r.x, 2. ) + pow( r.y, 2. ) + pow( r.z + 1., 2. ) );
	vec2 vN = r.xy / m + .5;
	vec3 base = texture2D( tMatCap, vN ).rgb;
	// end matcap
// 
	vec2 vUv1 = 1.5*vUv*vec2(4.,6. - 4.*smileProgress) - 2.*vec2(0.5,0.5);
	// vec4 smi = texture2D(tSmile, vUv1);

	vec4 smi;
	vec3 col;
	if(smile<3.5) {smi = texture2D(tSmile3, vUv1); col=vec3(0.,0.,1.);}
	if(smile<2.5) {smi = texture2D(tSmile2, vUv1); col=vec3(1.,0.,1.);}
	if(smile<1.5) {smi = texture2D(tSmile1, vUv1); col=vec3(1.,1.,0.);}
	if(smile<0.5) {smi = texture2D(tSmile, vUv1); col=vec3(1.,0.,0.);}
	
	
	


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
	float opacity = smoothstep(0.,0.1,smileProgress);

	// gl_FragColor = vec4(gl_FragColor.rgb*vec3(0.894, 0.918, 0.944),0.6);
	// gl_FragColor = vec4(gl_FragColor.rgb*vec3(0.894, 0.918, 0.944),0.);
	vec3 blend = blendAdd(reflectedColor.rgb, base);
	gl_FragColor = vec4(blend,gl_FragColor.a);
	gl_FragColor += smi*smi.a*opacity*(1. - gl_FragColor.a);

	// gl_f
	// gl_FragColor = vec4(base,1.);
	// gl_FragColor = vec4(base,1.);
	// gl_FragColor = vec4(blend,1.);
	// gl_FragColor = vec4(vNormal,1.);
	// gl_FragColor = vec4(vec3(angle),1.);
	// gl_FragColor = vec4(1.,0.,0.,0.5);
	// gl_FragColor = vec4(vUv,0.,1.);
	// gl_FragColor = smi;
}