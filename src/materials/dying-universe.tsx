import * as THREE from 'three'

const frag = /* glsl */ `
// "Dying Universe" by Martijn Steinrucken aka BigWings - 2015
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
// Email:countfrolic@gmail.com Twitter:@The_ArtOfCode

// Modified by @JureTriglav (2021) to support interactivity and WebXR under the same CC-BY-NC-SA 3.0 license

// Song:
// Cubicolor - Fictionalise (Lindstrøm & Prins Thomas Remix)
// https://soundcloud.com/cubicolor/fictionalise-lindstrom-prins-thomas-remix
precision highp float;
uniform vec4      resolution;           // viewport resolution (in pixels)
uniform vec4 virtualCameraQuat;
uniform vec3 virtualCameraPosition;
uniform vec3 localCameraPos;
uniform float     iTime;                 // shader playback time (in seconds)
uniform int       iFrame;                // shader playback frame
uniform sampler2D iChannel0;          // input channel. XX = 2D/Cube

uniform vec3 leftControllerPosition;
uniform vec3 rightControllerPosition;

uniform vec3 iChannelResolution[1];

uniform float zNear;
uniform float zFar;

in vec2 vUv;
in vec3 vPosition;
in mat4 vViewMatrix;
in mat4 vProjectionMatrix;
in mat4 vModelViewMatrix;
in mat4 vModelViewProjectionMatrix;

vec4 COOLCOLOR = vec4(1.,.5,0.,0.);
vec4 HOTCOLOR = vec4(0.,0.1,1.,1.);

vec4 MIDCOLOR = vec4(0.5,0.3,0.,1.);
float STARSIZE = 0.03;
#define NUM_STARS 100
#define NUM_BOUNCES 6
#define FLOOR_REFLECT
#define CONTROLLER_SIZE 1.0
#define saturate(x) clamp(x,0.,1.)
float DistSqr(vec3 a, vec3 b) { vec3 D=a-b; return dot(D, D); } 
float dist2(vec2 P0, vec2 P1) { vec2 D=P1-P0; return dot(D,D); }

const vec3 up = vec3(0.,1.,0.);
const float pi = 3.141592653589793238;
const float twopi = 6.283185307179586;
float time;

struct ray {
    vec3 o;
    vec3 d;
};
ray e;				// the eye ray

struct camera {
    vec3 p;			// the position of the camera
    vec3 i;			// where the current ray intersects the screen, in world coords
    ray ray;		// the current ray: from cam pos, through current uv projected on screen
    float zoom;		// the zoom factor
};
camera cam;

void CameraSetup(vec3 ro, vec3 rd, float zoom) {
    cam.zoom = zoom;
    cam.ray.o = ro;
    cam.ray.d = rd;
}

vec4 Noise401( vec4 x ) { return fract(sin(x)*5346.1764); }
vec4 Noise4( vec4 x ) { return fract(sin(x)*5346.1764)*2. - 1.; }
float Noise101( float x ) { return fract(sin(x)*5346.1764); }

float hash( float n ) { return fract(sin(n)*753.5453123); }
float noise( in vec3 x )
{
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f*f*(3.0-2.0*f);
	
    float n = p.x + p.y*157.0 + 113.0*p.z;
    return mix(mix(mix( hash(n+  0.0), hash(n+  1.0),f.x),
                   mix( hash(n+157.0), hash(n+158.0),f.x),f.y),
               mix(mix( hash(n+113.0), hash(n+114.0),f.x),
                   mix( hash(n+270.0), hash(n+271.0),f.x),f.y),f.z);
}
const mat3 m = mat3( 0.00,  0.80,  0.60,
                    -0.80,  0.36, -0.48,
                    -0.60, -0.48,  0.64 );


float PeriodicPulse(float x, float p) {
  // pulses from 0 to 1 with a period of 2 pi
  // increasing p makes the pulse sharper
	return pow((cos(x+sin(x))+1.)/2., p);
}

float SlantedCosine(float x) {
  // its a cosine.. but skewed so that it rises slowly and drops quickly
  // if anyone has a better function for this i'd love to hear about it
	x -= 3.55;	// shift the phase so its in line with a cosine
  return cos(x-cos(x)*0.5);
}

vec3 ClosestPoint(ray r, vec3 p) {
    // returns the closest point on ray r to point p
    return r.o + max(0., dot(p-r.o, r.d))*r.d;
}



float BounceFast(float t) {
	// Precomputed bounced interpolation
    // 2 bounces, decay of 0.3
    
    t *= 2.695445115; // comment out if you don't need t normalized
    
    float a1 = 1.-t*t;
    t -= 1.5477225575; // 1 + sqrt(0.3)
    float a2 = 0.3-t*t;
    t -= 0.8477225575; // sqrt(0.3) + sqrt(0.09)
    float a3 = 0.09-t*t;
    
    return max(max(a1, a2), max(a3, 0.));
}

#define NUM_ARCS NUM_BOUNCES+1
float Bounce(float t, float decay) {
    // Returns a bounced interpolation
    // t = time
    //     start of bounce is 0   
    //     end of bounce depends on number of bounces and decay param
    // decay = how much lower each successive bounce is
    //		0 = there is no bounce at all
    //		0.5 = each successive bounce is half as high as the previous one
    //		1 = there is no energy loss, it would bounce forever
 
    
    float height = 1.;
    float halfWidth=1.;
    float previousHalf = 1.;
    		
    float y = 1.-t*t;
   
    height = 1.;
    for(int i=1; i<NUM_BOUNCES; i++) {
        height *= decay;
        previousHalf = halfWidth;
    	halfWidth = sqrt(height);
        t -= previousHalf + halfWidth;
        y = max(y, height - t*t);
    }
    
    return saturate( y );
}

float BounceNorm(float t, float decay) {
    // Returns a bounced interpolation
    // Like Bounce but this one is time-normalized
    // t = 0 is start of bounce
    // t = 1 is end of bounce
    
    float height = 1.;
    
    float heights[NUM_ARCS]; heights[0] = 1.;
    float halfDurations[NUM_ARCS]; halfDurations[0] = 1.;
    float halfDuration = 0.5;
    for(int i=1; i<NUM_ARCS; i++) {			// calculate the heights and durations of each bounc
    	height *= decay;
        heights[i]= height;
        halfDurations[i] = sqrt(height);
        halfDuration += halfDurations[i];
    }	
	t*=halfDuration*2.;						// normalize time
    		
    float y = 1.-t*t;
   
    for(int i=1; i<NUM_ARCS; i++) {
        t -=  halfDurations[i-1] + halfDurations[i];
        y = max(y, heights[i] - t*t);
    }
    
    return saturate( y );
}

vec3 IntersectPlane(ray r, vec4 plane) {
    // returns the intersection point between a ray and a plane
	vec3 n = plane.xyz;
    vec3 p0 = plane.xyz*plane.w;
    float t = dot(p0-r.o, n)/dot(r.d, n);
    return r.o+max(0.,t)*r.d;				// not quite sure what to return if there is no intersection
    										// right now it just returns the ray origin
}
vec3 IntersectPlane(ray r) {
    	// no plane param gives ground-plane intersection
    return IntersectPlane(r, vec4(0.,1.,0.,0.));
}

float Circle(vec2 pos, vec2 uv, float radius) {
	return smoothstep(radius, radius*0.9, length(uv-pos));
}

// -------------------------------------------------------------


vec4 Star(ray r, float seed) {
  vec4 noise = Noise4(vec4(seed, seed+1., seed+2., seed+3.));
    
  float t = fract(time*0.1+seed)*2.;
  
  float fade = smoothstep(2., 0.5, t);		// fade out;
  vec4 col = mix(COOLCOLOR, HOTCOLOR, fade); // vary color with size
  float size = STARSIZE+seed*0.03;					// random variation in size
  size *= fade;
  
  float b = BounceNorm(t, 0.4+seed*0.1)*7.;
  b+=size;
  
  vec3 sparkPos = vec3(noise.x*10., b, noise.y*10.);
  vec3 closestPoint = ClosestPoint(r, sparkPos);
  
  float dist = DistSqr(closestPoint, sparkPos)/(size*size);
  float brightness = 1./dist;
  col *= brightness;
  
  
  return col;
}

vec4 ControllerStarPos(vec3 pos) {
  vec3 sparkPos = vec3(pos.x, pos.y, pos.z);
  return vec4(sparkPos.xyz, STARSIZE*CONTROLLER_SIZE);
}

vec4 ControllerStars(ray r, vec3 pos) {
  vec4 star = ControllerStarPos(pos);
  vec4 col = mix(COOLCOLOR, HOTCOLOR, star.w); // vary color with size
  vec3 closestPoint = ClosestPoint(r, star.xyz);
  
  float dist = DistSqr(closestPoint, star.xyz)/(star.w*star.w);
  float brightness = 1./dist;
  col *= brightness;
  return col;
}


// vec3 stars[100];

// vec4 Star2(ray r, int i) {
//     vec3 sparkPos = stars[10];
//     vec3 closestPoint = ClosestPoint(r, sparkPos);
    
//     float dist = DistSqr(closestPoint, sparkPos)/(0.01);
//     float brightness = 1./dist;
//     vec4 col = vec4( brightness );
    
    
//     return col;
// }

vec4 Stars(ray r) {
    vec4 col = vec4( 0. );
    
    float s = 0.;
    for(int i=0; i<NUM_STARS; i++) {
    	s++;
        col += Star(r, Noise101(s));
    }
    
    return col;
}

float Greasy(vec3 I) {
    vec3 q = 8.0*I;
    float f;
    f  = 0.5000*noise( q ); q = m*q*2.01;
    f += 0.2500*noise( q ); q = m*q*2.02;
    f += 0.1250*noise( q ); q = m*q*2.03;
    f += 0.0625*noise( q ); q = m*q*2.01;
    
    return f;
        
}

vec4 CalcStarPos(int i) {
	// returns the position in xyz and the fade value in w
    
    float n = Noise101(float(i));
    
    vec4 noise = Noise4(vec4(n, n+1., n+2., n+3.));
    
	float t = fract(time*0.1+n)*2.;
    
    float fade = smoothstep(2., 0.5, t);		// fade out;
    
    float size = STARSIZE+n*0.03;					// random variation in size
    size *= fade;
    
    float b = BounceNorm(t, 0.4+n*0.1)*7.;
    b+=size;
    
    vec3 sparkPos = vec3(noise.x*10., b, noise.y*10.);
    
    return vec4(sparkPos.xyz, fade);
}

vec4 GroundStarLight(vec4 star, vec3 I, vec3 R, vec4 ground) {
    vec3 L = star.xyz-I;
    float dist = length(L);
    L /= dist;
    
    float lambert = saturate(dot(L, up));
    float light = lambert/pow(dist,1.);
    
    vec4 col = mix(COOLCOLOR, MIDCOLOR, star.w); // vary color with size
    vec4 diffuseLight =  vec4(light)*0.1*col;
    
    ground += diffuseLight*(sin(time)*0.5+0.6);
    
    #ifdef FLOOR_REFLECT
    float spec = pow(saturate(dot(R, L)), 400.);
    float fresnel = 1.-saturate(dot(L, up));
    fresnel = pow(fresnel, 10.);
    
    vec4 specLight = col*spec/(dist);
    specLight *= star.w;
    ground += specLight*0.5*fresnel;
    #endif
    return ground;
}
        


vec4 Ground(ray r) {
	
    vec4 ground = vec4(0.);

    if(r.d.y>0.) return ground;
    
    vec3 I = IntersectPlane(r);		// eye-ray ground intersection point
    
    vec3 R = reflect(r.d, up);
    ray ref = ray(I, R);
           
    for(int i=0; i<NUM_STARS; i++) {
    	vec4 star = CalcStarPos(i);

      ground = GroundStarLight(star, I, R, ground);
    }
    
    ground = GroundStarLight(ControllerStarPos(leftControllerPosition), I, R, ground);
    ground = GroundStarLight(ControllerStarPos(rightControllerPosition), I, R, ground); 
    
    return ground;
}

vec3 rotate_vector( vec4 quat, vec3 vec) {
  return vec + 2.0 * cross( cross( vec, quat.xyz ) + quat.w * vec, quat.xyz );
}

void main()
{
  vec2 uv = vUv;
  highp vec3 ro = virtualCameraPosition;
  vec3 someVec = normalize(vPosition - localCameraPos);
  someVec = rotate_vector(virtualCameraQuat, someVec);
  vec3 rd = normalize(someVec);

	time = iTime*0.0002;
    gl_FragColor = vec4(uv,0.5+0.5*sin(iTime),1.0);
    
   
    time *= 2.;
    
	float t = time*pi*0.1;
    COOLCOLOR = vec4(sin(t), cos(t*0.23), cos(t*0.3453), 1.)*0.5+0.5;
    HOTCOLOR = vec4(sin(t*2.), cos(t*2.*0.33), cos(t*0.3453), 1.)*0.5+0.5;
   	
    vec4 white = vec4(1.);
    float whiteFade = sin(time*2.)*0.5+0.5;
    HOTCOLOR = mix(HOTCOLOR, white, whiteFade);
    
    MIDCOLOR = (HOTCOLOR+COOLCOLOR)*0.5;
    
    // float s = sin(t);
    // float c = cos(t);
    // mat3 rot = mat3(	  c,  0., s,
    //                		  0., 1., 0.,
    //                		  s,  0., -c);
    
    // float camHeight = mix(3.5, 0.1, PeriodicPulse(time*0.1, 2.));
    // vec3 pos = vec3(0., camHeight, -10.)*rot*(1.+sin(time)*0.3);
   	
    CameraSetup(ro, rd, 0.5);
    
    gl_FragColor = Ground(cam.ray);
    gl_FragColor += ControllerStars(cam.ray, leftControllerPosition);
    gl_FragColor += ControllerStars(cam.ray, rightControllerPosition);
    gl_FragColor += Stars(cam.ray);

}
`;


const vertex = /* glsl */ `
// #version 300 es
// Some custom stuff
// uniform mat4 modelMatrix;
// uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;
// uniform mat4 viewMatrix;
// // uniform vec3 cameraPosition;
// in vec3 position;
// End custom for RawShader
// in vec2 uv;

precision highp float;
uniform float time;
out vec2 vUv;
out vec3 vPosition; // localSurfacePos

uniform vec3 worldDirection;
uniform vec2 pixels;
out mat4 vViewMatrix;
out mat4 vProjectionMatrix;
out mat4 vModelViewProjectionMatrix;
out mat4 vModelViewMatrix;


out vec3 cameraForward;


float PI = 3.141592653589793238;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1);
  vViewMatrix = viewMatrix;
  vProjectionMatrix = projectionMatrix;
  vModelViewMatrix = modelViewMatrix;
  vModelViewProjectionMatrix = projectionMatrix * modelViewMatrix;
  vPosition = position;

  cameraForward = worldDirection;
}
`;

export const material = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  uniforms: {
    iTime: { value: 0 },
    iFrame: { value: 0 },
    mouse: { value: new THREE.Vector2(0, 0) },
    iChannelResolution: {
      value: [new THREE.Vector2(256.0, 256.0)],
    },
    localCameraPos: { value: new THREE.Vector3(0) },
    resolution: { value: new THREE.Vector4() },
    virtualCameraQuat: { value: new THREE.Vector4(0, 0, 0, 0) },
    virtualCameraPosition: { value: new THREE.Vector3(0, 0, 0) },
    leftControllerPosition: { value: new THREE.Vector3(0, 0, 0) },
    rightControllerPosition: { value: new THREE.Vector3(0, 0, 0) },
    zNear: { value: 0 },
    zFar: { value: 0 },
    worldDirection: { value: new THREE.Vector3() },
  },
  vertexShader: vertex,
  fragmentShader: fragment,
  transparent: true,
  premultipliedAlpha: true,
  depthTest: true,
  depthWrite: true,
})

export const geometry = (main) => {}
 
export const fly = true
export const cameraOffset = new THREE.Vector3(0, 0.5, 0)