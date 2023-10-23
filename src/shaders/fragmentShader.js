const fragmentShader = `
vec3 colorA = vec3(0.912,0.191,0.652);
vec3 colorB = vec3(1.000,0.777,0.052);

void main() {
  vec3 color = mix(colorA, colorB, 0.5);

  gl_FragColor = vec4(color,1.0);
}`


export default fragmentShader
