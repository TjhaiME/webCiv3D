const fragmentShader = `
// shader_type spatial;
// render_mode unshaded, cull_front;

//CONVERTING FROM GDSHADER to GLSL

//global uniform sampler3D noiseBox; //WE MAKE IT IN CODE, AS THAT FIXED ISSUES
//uniform sampler3D noiseBox; //We use this while in the editor to not get the error stuck on the above term

//uniform float time;
//const float one = 1.0;
//float PI = 3.14159265359;
//const float TWO_PI = 2.0 * PI;
//const vec4 line_color = vec4(0.0, 1.0, 0.0, 1.0);
//const vec4 background_color = vec4(0.0, 0.0, 0.0, 1.0);

//uniform texture noise1; //make two of them with different settings so we can multiply and get different looking areas

//https://godotengine.org/article/godot-40-gets-global-and-instance-shader-uniforms/
//global and instance based variables, this will mean we can share this noise with everything without passing it to them all seperatley
//also instance variables can be used instead of having a new material for each instance of a scene


//We declare the uniforms in Three.js?

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




varying vec3 pixPos;


//uniform sampler2D depth_texture : hint_depth_texture, repeat_disable, filter_nearest;

void main() { //was fragment, DRAWING THE STARS

	// vec3 unprojecta(vec3,float,int);
	// vec3 unprojecta(vec3 diffVec, float distSq, int i){
	// 	float obsDistOut = sqrt(distSq); //observedDistanceOut for the pixel
	// 	float actualDistOut = obsDistOut*radius[i]/observedRadii[i]; //actual DistanceOut if the pixel was on a plane located at the object
	// 	float extraDist = sqrt(radius[i]*radius[i]-actualDistOut*actualDistOut);
	// 	vec3 posOnSphere = (distances[i]-extraDist)*objDirs[i] + (actualDistOut/obsDistOut)*(diffVec) + camPos;
	// 	vec3 sphereDir = posOnSphere - positions[i];
	// 	return posOnSphere;
	// }



	vec4 pixel_position = pixPos;//INV_VIEW_MATRIX*vec4(VERTEX,1.0);//INV_VIEW_MATRIX works to convert pixelPos relative to camera (vertex (in fragment)) to world coordinates
	//vec3 normalV = normalize(pixel_position.xyz);//we shouldnt need to normalize in the actual function this is just to see if its working
	//ALBEDO = normalV;//pixel_position.xyz;
	
//	Use similar triangles to determine apparent screen position
//	y_s/d_s = y/d (y_s is screen height, d_s is distance to screen, y is actual height, d is actual distance away)
	int limit = 10;
	bool complete = false;
	
	
	//We need a constant screen value to reference the group we are in
	vec3 screenMid = distToSky*camDir + camPos;
	vec3 deltaFromMid = pixel_position.xyz - screenMid;
	vec3 planarDelta = deltaFromMid - dot(deltaFromMid,camDir)*camDir;
	vec2 screenDelta = vec2(dot(deltaFromMid,camBasis*vec3(1,0,0)),dot(deltaFromMid,camBasis*vec3(0,1,0)));//camBasis*vec3(1,0,0) = camBasis.x
	//would be better to just transfer the data as 3 vectors
	vec2 indexVec = vec2(floor(screenDelta.x*FOVDivider/halfScreenWidth), floor(screenDelta.y*FOVDivider/halfScreenWidth));
	//indexVec = clamp(indexVec,vec2(-FOVDivider,-FOVDivider), vec2(FOVDivider,FOVDivider));//didnt work for gdscript
	indexVec.x = clamp(indexVec.x,-FOVDivider,FOVDivider);
	indexVec.y = clamp(indexVec.y,-FOVDivider,FOVDivider);
	//int myIndex = get_index_from_iVec(indexVec)
	int myIndex = (int(indexVec.y)+int(FOVDivider))*(2*int(FOVDivider) + 1) + (int(indexVec.x)+int(FOVDivider));
	
	//this is the index of the segmentList we need to get indexes from
	int startPoint = startEndPairs[2*myIndex]; //list n -> 2n,2n+1
	int endPoint = startEndPairs[2*myIndex+1];
	//so my list is the list between startPoint and endPoint in allSegmentIndexes
	if(startPoint == -1){ //nothing in this segment
		//complete = true; #must stay false to draw black
		startPoint = 0;
		endPoint = 0;
	}
	vec3 ALBEDO = vec3(1,1,1)
	//for(int i = 0; i < limit; i++){
	for(int n = startPoint; n < endPoint+1; n++){
		if(complete == false){
			int i = allSegmentIndexes[n];
			vec3 dir = objDirs[i];
			vec3 objProjPos = positions[i] - (distances[i]-distToSky)*dir;//camDir;
			//float actualRad = radius[i];
			float observedRad = observedRadii[i];
			//is pixel_position.xy in the region bounded by the circle with centre = actualPos.xy and radius = observedRad
			//check distance squared
			//to make exact we should project the pixel position onto the tangent plane
			// proj_plane(v) = v - proj_normal(v) = v - v.dot(camDir)*camDir
			vec3 pixelPlanarPos = pixel_position.xyz;// - dot(pixel_position.xyz,camDir)*camDir; //was working? with dir
			
			
			
			//vec2 diffVec = vec2(pixelPlanarPos.x - objProjPos.x,pixelPlanarPos.y - objProjPos.y);//pixel_position.xy - actualPos.xy;
			vec3 diffVec = pixelPlanarPos - objProjPos;
			
			float distSq = (diffVec.x*diffVec.x) + (diffVec.y*diffVec.y) + (diffVec.z*diffVec.z);
			if(distSq <= observedRad*observedRad){//(distSq - 5999990.0 <= observedRad*observedRad) sort of shows the result we want
				//maybe our radii are too big
				//we should check if its olid (transparent) before stating complete
				complete = true;
				//ALBEDO = colours[i].xyz;
				
				//Method 2, check its texture function first
				if(texIDs[i] == 3){
					//it is a planet so it doesnt emit its own light
					//check the dot product of the vector from the centre to my point on the sphere and the dir to my main star
					//float extraDist = sqrt(radius[i]*radius[i]*(1.0-distSq) + distSq*distSq);
					//vec3 sphereDir = pixelPlanarPos + (distances[i]-distToSky + extraDist)*dir - positions[i];
					//vec3 sphereDir = diffVec;//- positions[i];
					float obsDistOut = sqrt(distSq); //observedDistanceOut for the pixel
					float actualDistOut = obsDistOut*radius[i]/observedRad; //actual DistanceOut if the pixel was on a plane located at the object
					float extraDist = sqrt(radius[i]*radius[i]-actualDistOut*actualDistOut); //extra outwards distance the vector has to travel to be at that point
					//vec3(camToActualPixelPoint) = (distances[i]-extraDist)*dir + (actualDistOut/obsDistOut)*(diffVec)
					//camToActualPixelPoint = ActualPoint - camPos
					//SphereDir = ActualPoint - sphereOrigin
					//SphereDir = (camToActualPixelPoint + camPos) - sphereOrigin
					//vec3 sphereDir = (distances[i]-extraDist)*dir + (actualDistOut/obsDistOut)*(diffVec) + camPos - positions[i];
					
					vec3 spherePos = unprojecta(diffVec, distSq, i);
					vec3 sphereDir = spherePos - positions[i];
					//float extraDist = sqrt(radius[i]*radius[i]*(1.0-distSq) + distSq*distSq);
					//if(dot(sphereDir,lightDirs[i]) <= 0.0){
					float condition = dot(sphereDir,lightDirs[i]);
					if(condition < 0.0){//if(dot(camPos,vec3(1,0,0)) <= 0.0){ //works as expected
						ALBEDO = vec3(0,0,0);
					}
					else{
						if(condition == 0.0){
							ALBEDO = vec3(1,1,1);
						}
						else{
							ALBEDO = colours[i].xyz;
						}
						
						//ALBEDO = vec3(1,1,1);
					}
				}
				else if(texIDs[i] == 5){
					//texture it as a big transparent gas cloud
					//we want to have a gas cloud that has a high chance of blocking light in the middle of the circle but a low chance om the outside and with a wiggly effect
					//use noise Tex to modify it
					//distSq is our dist square from middle on the observed circle
					//we need an angle too, our angle on the observed circle to give us a max distance for that angle
					
					
				}
				else{
					//test textures
					//ALBEDO = colours[i].xyz;// * texture(noiseBox, pixel_position.xyz).xyz;
					
					//vec3 spherePos = unprojecta(diffVec, distSq, i);
					//vec3 sphereDir = spherePos - positions[i];
					ALBEDO = colours[i].xyz// * texture(noiseBox, 0.001*sphereDir).xyz;
					
				}
			}
		}
	}
	if(complete == false){
		//ALBEDO = vec3(0,0,0);
		vec3 normalV = normalize(pixel_position.xyz);
		ALBEDO = normalV;//pixel_position.xyz;
		
		//ALBEDO = texture(noiseBox, 32.0*normalize(pixel_position.xyz) + vec3(32.0,32.0,32.0)).xyz; 
		//ALBEDO = texture(noiseBox, 1.0*normalize(pixel_position.xyz) + 0.0*vec3(1.0,1.0,1.0)).xyz;
		//ALBEDO = texture(noiseBox, vec3(32.0,32.0,0.0)).xyz;
	}
    //we need colour as a vec4
    gl_FragColor = vec4(ALBEDO, 1);
}
`

export default fragmentShader