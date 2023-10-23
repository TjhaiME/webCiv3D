const vertexShader = `
//for drawing the stars
//it will only be the ones in our FOV
uniform float distToSky;// = 1990.0;
uniform float FOVDivider;// = 5.0;
uniform float halfScreenWidth;// = 1000.0;

uniform vec3 camDir;// = vec3(0,0,-1);//obsolete, can get from -camBasis.z
uniform mat3 camBasis;
uniform vec3 camPos;
const int arrSize = 5000;
uniform vec3[arrSize] positions;
uniform vec4[arrSize] colours;
uniform int[arrSize] texIDs;
uniform float[arrSize] radius;
uniform bool[arrSize] solid;
uniform float[arrSize] distances;
uniform float[arrSize] observedRadii;
uniform vec3[arrSize] objDirs;
uniform vec3[arrSize] lightDirs;

//If we want to segment the screen to reduce the for loop size we will need either multiple arrays or 2 LONG arrays
// 5000 1500
uniform int[50000] allSegmentIndexes; //a list of lists of indexes to use with the above uniform arrays
uniform int[10000] startEndPairs; // to identify where each list starts and end in allSegmentIndexes //SIZE = 2*((2*FovDivider + 1)^2)

varying vec2 vUv;
varying vec3 pixPos;


void main() {
  vUv = uv;
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  pixPos = projectedPosition.xyz;
  gl_Position = projectedPosition;
}


`

export default vertexShader