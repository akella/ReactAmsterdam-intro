uniform float time;
uniform float progress;
uniform vec3 color;
varying vec3 vColor;
varying vec3 vPosition;
varying float vRotation;
varying vec3 vNormal;
varying vec2 vUv;

varying float offset;
varying float vProgress;
varying float dProgress;

uniform sampler2D texture;
uniform sampler2D texture1;

uniform float reveal;
varying float rProgress;





void main()	{
	vec4 color = texture2D(texture,vUv);
	vec4 color1 = texture2D(texture1,vUv);

    vec4 finalColor = color;
	// finalColor = vec4(dProgress,0.,0.,1.);
	// finalColor = color1;
    // float o = offset/10.;
    // float t = fract(time/30.  + o);
    // float length = 0.3;
    // if(abs(vUv.x - t)>length && abs(vUv.x - t + 1.)>length && abs(vUv.x - t - 1.)>length){
    //     discard;
    // }

    // float color = dot(vec3(1.,1.,0.),vNormal);
 //    vec3 normal = normalize(cross(dFdx(vPosition),dFdy(vPosition)));
 //    vec3 light = vec3(0.,0.,1.);
 //    vec3 prod = clamp(cross(normal,light), 0., 1.0);
	// vec3 color = clamp(hsl2rgb(vColor/3.,0.9,0.66) +vec3(0.3)*abs(sin(vRotation)),0.,1.);
 //    gl_FragColor = vec4(color,1.);
 //    gl_FragColor = vec4(vRotation);
    gl_FragColor = vec4(vUv,0.,1.);
    gl_FragColor = mix(vec4(0.140, 0.185, 0.198,1.), color1, max(0.1,vProgress));
    gl_FragColor = mix(gl_FragColor, color, rProgress);
    // gl_FragColor = reveal;
    // gl_FragColor = vec4(4.*vProgress,4.*vProgress,4.*vProgress,1.);
}