//for testing three.js
import './style.css'

import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

//import fShader from './starFrag.glsl'
//import vShader from './defaultShader.glsl'

function v3Add(vec1,vec2){
    var newVec = new THREE.Vector3(0,0,0)
    newVec.add(vec1)
    newVec.add(vec2)
    return newVec
}
function v3PtMult(vec1,vec2){
    var newVec = new THREE.Vector3(1,1,1)
    newVec.multiply(vec1)
    newVec.multiply(vec2)
    return newVec
}

function v3Clone(oldVec3){
	var newVec3 = new THREE.Vector3(0,0,0)
	newVec3.set(oldVec3.x,oldVec3.y,oldVec3.z)
	return newVec3
}


//we need a scene to put things in
const scene = new THREE.Scene(); //a scene is like a ocntainer that holds all objects, cameras and lights

//we need a camera to look at the scene
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 2000);

//we need a renderer
//this is weird code for an argument, is it a js object with a single key value?
const renderer = new THREE.WebGLRenderer({
canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio( window.devicePixelRatio);
renderer.setSize( window.innerWidth, window.innerHeight);//set to fullscreen
camera.position.setZ(30);//move us to a better spot

renderer.render( scene, camera );


//ad an object
const geometry = new THREE.TorusGeometry(10,3,16,100)
const material = new THREE.MeshStandardMaterial({color: 0xFF6347}); //MeshBasicMaterial is unaffected by lighting, which is useful for me
//We can write custom ones in GLSL and apply them https://medium.com/@pailhead011/writing-glsl-with-three-js-part-1-1acb1de77e5c
const torus = new THREE.Mesh( geometry, material);

scene.add(torus) //scene.add_child(node)...essentially

//make a new point light
//doesnt seem to be working for me
// const pointLight = new THREE.PointLight(0xffffff);
// pointLight.position.set(5,5,5);
// scene.add(pointLight);
//use ambientLight instead for whole scene lighting
const ambientLight = new THREE.AmbientLight(0xffffff)
scene.add(ambientLight);
//one time re-render
//renderer.render(scene,camera); //need to re render scene

// const lightHelper = new THREE.PointLightHelper(pointLight);
// scene.add(lightHelper);
const gridHelper = new THREE.GridHelper(200,50);
scene.add(gridHelper);

const controls = new OrbitControls(camera, renderer.domElement);//listen to dom events on the mouse to update camera position

function addVarStar(radius, colourHex, resolution, pos){
    //console.log("radius = " + radius + " , colourHex = "+colourHex+" , rseolution = "+resolution+" pos = "+pos+" = "+pos[0]+", "+pos[1]+", "+pos[2])
    const starGeo = new THREE.SphereGeometry(radius,resolution,resolution);
    const starMat = new THREE.MeshBasicMaterial({color: colourHex});
    const star = new THREE.Mesh( starGeo, starMat);

    //const [x,y,z] = Array(3).fill().map( () => THREE.MathUtils.randFloatSpread(100) );

    star.position.set(pos[0],pos[1],pos[2]);
    scene.add(star) 
}

function addStar() {
    const [x,y,z] = Array(3).fill().map( () => THREE.MathUtils.randFloatSpread(100) );
    var pos = [x,y,z];
    addVarStar(0.25, 0xffffff, 24, pos);
    /*
    const starGeo = new THREE.SphereGeometry(0.25,24,24);
    const starMat = new THREE.MeshBasicMaterial({color: 0xffffff});
    const star = new THREE.Mesh( starGeo, starMat);

    const [x,y,z] = Array(3).fill().map( () => THREE.MathUtils.randFloatSpread(100) );

    star.position.set(x,y,z);
    scene.add(star) //this is something we are adding without getting a reference to it for later
    */
}



























//
//                                       Copying over Javascript code Start
//
var celestialBodies = {}
var celestialBodyEntryDefault = {
	pos : [0,0,0],//Vector3(0,0,0),
	rad : 1.0,
	col : 0xffffff,//Color(1,1,1,1),
	solid : true, //false if transparent, if true we dont keep searching, if false like a gas cloud then we look behind to check for another object
	far : Infinity, //whats my distance away #only updated if in range
	skyRad : 1.0, //whats my observed distance
	mass : 1.0,
	type : 0,//0 is small star, 1 is supernova star, 2 is compact star, 3 is planet, 4 is ... 
	elements : [1.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0], //up to fe happens in normal stars, then we get higher atomiv number things as bigger supernovae happen, we need a number giving us the 
	vel : [0,0,0],//Vector3(0,0,0),
	norm : [0,0,0],//Vector3(0,0,0), //if in orbit, this is the normal of the plane that everything is orbiting on
	lightDir : [0,0,0],//Vector3(0,0,0)
}
/*
var celestialBodyEntryDefault = {
	"pos" : [0,0,0],//Vector3(0,0,0),
	"rad" : 1.0,
	"col" : 0xffffff,//Color(1,1,1,1),
	"solid" : true, //false if transparent, if true we dont keep searching, if false like a gas cloud then we look behind to check for another object
	"far" : Infinity, //whats my distance away #only updated if in range
	"skyRad" : 1.0, //whats my observed distance
	"mass" : 1.0,
	"type" : 0,//0 is small star, 1 is supernova star, 2 is compact star, 3 is planet, 4 is ... 
	"elements" : [1.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0], //up to fe happens in normal stars, then we get higher atomiv number things as bigger supernovae happen, we need a number giving us the 
	"vel" : [0,0,0],//Vector3(0,0,0),
	"norm" : [0,0,0],//Vector3(0,0,0), //if in orbit, this is the normal of the plane that everything is orbiting on
	"lightDir" : [0,0,0],//Vector3(0,0,0)
}*/
var maxStarRadius = 1000
function generate_random_stars(){
	//randomize()
	var amount = 500;
	for(var i=0;i<amount;i++){
		celestialBodies[i] = structuredClone(celestialBodyEntryDefault);
		var min = 3050;
		var max = 60000;
		var d = randf_range(min,max);
		
		var u = randf_range(0,Math.PI);
		var v = randf_range(0,2*Math.PI);
		//var z = randf_range(min,max)
		var randDir = new THREE.Vector3(Math.sin(u)*Math.cos(v), Math.sin(u)*Math.sin(v), Math.cos(u));// + $CameraWorld.global_transform.origin
		
		celestialBodies[i]["pos"] = randDir.multiplyScalar(d);//d*randDir;
		var pos = celestialBodies[i]["pos"]
		//console.log(typeof(pos)+",pos = "+pos.x+","+pos.y+","+pos.z)
		celestialBodies[i]["rad"] = randf_range(500,maxStarRadius);//randf_range(5000,10000) //changing this isnt reducing the observed radius
		celestialBodies[i]["col"] = new THREE.Vector4(randf_range(0,1),randf_range(0,1),randf_range(0,1),1.0);
    }
    //get_obj_list_for_spaceBox();
}
function randf_range(minVal,maxVal){
    //choose a random float between minVal and maxVal
    var diff = maxVal - minVal;
    var randMod = THREE.MathUtils.randFloatSpread(diff);
    var randVal = minVal + randMod;
    return randVal;
}

// function get_obj_list_for_spaceBox(){
//     //still need to convert to javascript
// }


//
//                                       Copying over Javascript code End
//

//function to add the star sphere to the scene

function addStarSphere(){
	var vShader = null
	var fShader = null
	var loader = new THREE.FileLoader();
	// loader.load('defaultShader.vert',function ( data ) {vShader =  data;},);
	// loader.load('starFrag.frag',function ( data ) {fShader =  data;},);

	var numFilesLeft = 2;
	var skySphereMesh = new THREE.Mesh()
  
	function runNextPartIfDone() {
	   --numFilesLeft;
	   if (numFilesLeft === 0) {
		skySphereMesh = addStarSphereP2(fShader,vShader);
	   }
	}
	
	loader.load('starFrag.glsl',function ( data ) {fShader =  data; runNextPartIfDone(); },);
	loader.load('defaultShader.glsl',function ( data ) {vShader =  data; runNextPartIfDone(); },);
	console.log(JSON.stringify(skySphereMesh))
	return skySphereMesh
}
function addStarSphereP2(fShader,vShader){//fShader,vShader
	//https://stackoverflow.com/questions/48186368/how-to-load-shader-from-external-file-three-fileloader
	//WE NEED TO MODIFY THIS SO IT WAITS UNTIL FILES ARE LOADED
	//IT seems we have to insert uniforms here
	const myArrSize = 5000;
	var myDefines = {
		arrSize: myArrSize, 
	}
	var vec3Arr = []
	var vec4Arr = []
	var intArr = []
	var floatArr = []
	var boolArr = []
	//all above have size myArrSize
	var bigIntArr = []//10000
	var hugeIntArr = []//50000
	//vec3Arr.fill(new THREE.Vector3(0,0,0), 0, myArrSize)//.doesnt go above max size
	for(var i=0;i<myArrSize;i++){
		vec3Arr.push(new THREE.Vector3(0,0,0))
		vec4Arr.push(new THREE.Vector4(0,0,0,0))
		intArr.push(0)
		floatArr.push(0.0)
		boolArr.push(true)
	}
	for(var i=0;i<50000;i++){
		hugeIntArr.push(0)
	}
	for(var i=0;i<10000;i++){
		bigIntArr.push(0)
	}
	var myUniforms = {
		"distToSky" : {value :1990.0},
		"FOVDivider" : {value :5},
		"halfScreenWidth" : {value :1000},
		"camDir" : {value :new THREE.Vector3(0.0,0.0,-1.0)},
		"camBasis" : {value :new THREE.Matrix3},
		"camPos" : {value :new THREE.Vector3(0.0,0.0,-1.0)},
		"positions" : {value :structuredClone(vec3Arr)},
		"colours" : {value :structuredClone(vec4Arr)},
		"texIDs" : {value :structuredClone(intArr)},
		"radius" : {value :structuredClone(floatArr)},
		"solid" : {value :structuredClone(boolArr)},
		"distances" : {value :structuredClone(floatArr)},
		"observedRadii" : {value :structuredClone(floatArr)},
		"objDirs" : {value :structuredClone(vec3Arr)},
		"lightDirs" : {value :structuredClone(vec3Arr)},
		"allSegmentIndexes" : {value :structuredClone(hugeIntArr)},
		"startEndPairs" : {value :structuredClone(bigIntArr)},
	};

	var newMaterial = new THREE.ShaderMaterial({
		defines: myDefines,
		uniforms: myUniforms,
		vertexShader: vShader,
		fragmentShader: fShader,
	
	});

	//now make the mesh and geometry and and apply the material and geo to the mesh.
    const starSphereGeo = new THREE.SphereGeometry(1990,24,24);
    //const starMat = new THREE.MeshBasicMaterial({color: 0xffffff});
    const starSphere = new THREE.Mesh( starSphereGeo, newMaterial);

    //const [x,y,z] = Array(3).fill().map( () => THREE.MathUtils.randFloatSpread(100) );

    starSphere.position.set(0,0,0);
    scene.add(starSphere) //this is something we are adding without getting a reference to it for later

	starSphere.material.side = THREE.BackSide;
	return starSphere
}


var cameraRef = camera
var skySphereRef = addStarSphere()
generate_random_stars()

var FOVDivider = 8//5
var halfScreenWidth = 1000//distToSky*sin(0.5*FOV)
var distToSky = 1990.0
var maxStarRadius = 1000
var spawnedStarMeshes = {
	//cKey : $ObjectReference
}

function deg_to_rad(degrees){
  var pi = Math.PI;
  return degrees * (pi/180);
}

function clamp(num, min, max){
	return Math.min(Math.max(num, min), max);
}
function range(start, stop, step){
	return Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));
}
function get_obj_list_for_spaceBox(){
	///vars from converting to javascript
	var camFOV = cameraRef.fov
	var cameraTForm = cameraRef.matrixWorld//global_transform
	var nearDist = cameraRef.near
	var camPos = new THREE.Vector3(0,0,0)
	camPos.setFromMatrixPosition(cameraTForm)
	var camX = new THREE.Vector3(1,0,0)
	var camY = new THREE.Vector3(0,1,0)
	var camZ = new THREE.Vector3(0,0,1)
	cameraTForm.extractBasis(camX,camY,camZ)
	

	var inFOVKeys = []
	//how do we get properties of the camera like its forward dir and fov
	var camDir = v3PtMult(new THREE.Vector3(-1,-1,-1), camZ)
	var FOV = deg_to_rad(camFOV + 30)//PI/3.0 //60 deg
	
	
	halfScreenWidth = distToSky*Math.sin(deg_to_rad(0.5*camFOV))
	
	for(var cKeyIndex = 0;cKeyIndex < Object.keys(celestialBodies).length; cKeyIndex++){
		var cKey = Object.keys(celestialBodies)[cKeyIndex]
		//turn into js loop
		//var diffVec = celestialBodies[cKey]["pos"] - camPos //camPos is (0,0,0,)
		var diffVec = v3Clone(celestialBodies[cKey]["pos"])
		var pos = celestialBodies[cKey]["pos"]
		//console.log(typeof(pos)+",cKey = "+cKey+", pos_LATER = "+pos.x+","+pos.y+","+pos.z)
		//console.log(typeof(diffVec)+", diffVec = "+diffVec.x+","+diffVec.y+","+diffVec.z)
		diffVec.sub(camPos)
		//console.log("diffVec = "+diffVec)
		var diffLength = diffVec.length()
		
		//custom FOV so we detect edges of planets better
		var customAngle = 0.5*FOV + Math.abs(Math.asin(celestialBodies[cKey]["rad"]/diffLength))
		customAngle = clamp(customAngle,0.0,Math.PI-0.05)
		var cosThreshold = Math.cos(customAngle)
		
		
		celestialBodies[cKey]["far"] = diffLength
		/*
		//////////////////////////////////
		//de/spawning stars as meshes not just pictures
		////////////////////////////////
		if diffLength <= distToSky + 0.5*maxStarRadius:
			//we need to also check if it is too close we shouldnt draw it on the sky
			
			
			//star is too close and we want to spawn it as a mesh instead
			if !spawnedStarMeshes.has(cKey):
				//it is not spawned yet
				var newStar = MeshInstance3D.new()
				newStar.mesh = SphereMesh.new()
				newStar.mesh.radius = celestialBodies[cKey]["rad"]
				newStar.mesh.height = 2*celestialBodies[cKey]["rad"]
				newStar.mesh.material = StandardMaterial3D.new()
				newStar.mesh.material.albedo_color = celestialBodies[cKey]["col"]
				//print("mode = ", newStar.mesh.material.shading_mode)
				newStar.mesh.material.shading_mode = 0 //Unshaded
				$World/Celestials.add_child(newStar)
				newStar.global_transform.origin = celestialBodies[cKey]["pos"]
				spawnedStarMeshes[cKey] = newStar
				continue
		else: //star is far away
			if spawnedStarMeshes.has(cKey):
				//if the star is already spawned and we move too far away we might want to despawn it
				var oldStar = spawnedStarMeshes[cKey]
				oldStar.queue_free()
				spawnedStarMeshes.erase(cKey)
		////////////////////////////////////
		*/
		//celestialBodies[cKey]["skyRad"] = float(distToSky*celestialBodies[cKey]["rad"])/float(diffLength)
		celestialBodies[cKey]["skyRad"] = distToSky*celestialBodies[cKey]["rad"]/diffLength
		//change these numbers so they are derived from the radius on the nearPlane of the camera
		
		var screenCull = 0.0//0.00001//0.0001 seems okay 0.005 should correspond to diameter of 1cm but seems between 1 and 2
		var planetCullRadius = 0.0//0.00001*(float(distToSky)/nearDist)
		//var starCullRadius = screenCull*(float(distToSky)/nearDist)//0.1
		var starCullRadius = screenCull*(distToSky/nearDist)//0.1
		if(celestialBodies[cKey]["type"] == 3){
			if(celestialBodies[cKey]["skyRad"] <= planetCullRadius){
				continue
			}
		}
		else{
			if(celestialBodies[cKey]["skyRad"] <= starCullRadius){
				continue
			}
		}
		var normalDiff = diffVec.normalize()//(1.0/diffLength)*diffVec
		celestialBodies[cKey]["objDirs"] = normalDiff
		//print("radius = ", celestialBodies[cKey]["rad"],",observedRadius = ", celestialBodies[cKey]["skyRad"], " distToSky = ", distToSky, ", diffLength = ", diffLength)
		
		//Now that we have the direction from the object to the point we get the dot product between that vector and the object's facing direction.
		//Facing direction (dot) direction to point
		
		var dotProd = camDir.dot(normalDiff)
		//print("camDir = ", camDir, ", normalDiff = ", normalDiff, ", dotProd = ", dotProd)
		
		//NOTE:
		//instead of checking if the middle is in FOV can we check if any point is or the closest point?
		
		if(dotProd >= cosThreshold){
			//we are in the field of view
			inFOVKeys.push(cKey)
		}
	}
	//now we need to sort inFOVKeys
	//so that the closest ones are at the front
	inFOVKeys = sort_inFOVKeys(inFOVKeys)
	
	//now we should add our planet keys to the data, in order
	//TO DO
	//for first n stars (closest ones)
	//append its planets after the star in inFOVKeys
	
	var inSegmentKeyIndexes = []
	var totalSegments = (2*FOVDivider + 1)*(2*FOVDivider + 1) //since -ve*FOV_DIVIDE + +ve*FOV_DIVIDE + 0 (e.g. FOVDivider = 3 -> -3,-2,-1,0,1,2,3)
	for(var i=0; i < totalSegments;i++){
		inSegmentKeyIndexes.push([])
	}
	//var deltaFromMid is position on sphere - screenMid
	//get my i,j coords by Math.floor(deltaFromMid.x*FOVDivider/halfScreenWidth) (.y for j)
	//var screenMid = distToSky*camDir + camPos
	var screenMid = v3Clone(camDir)
	screenMid.multiplyScalar(distToSky)
	screenMid.add(camPos)
	for(var keyIndex=0;keyIndex < inFOVKeys.length;keyIndex++){//Object.keys(celestialBodies):
		var cKey = inFOVKeys[keyIndex]
		//var objProjPos = celestialBodies[cKey]["pos"] - (celestialBodies[cKey]["far"]-distToSky)*celestialBodies[cKey]["objDirs"]
		var objProjPos = v3Clone(celestialBodies[cKey]["objDirs"])
		objProjPos.multiplyScalar(-1*(celestialBodies[cKey]["far"]-distToSky))
		objProjPos.add(celestialBodies[cKey]["pos"])


		//can I find a things coordinates on the screen by applying the camera transform
		//backwards to the shader
		//var deltaFromMid = objProjPos - screenMid
		var deltaFromMid = v3Clone(objProjPos)
		deltaFromMid.sub(screenMid)
		//project to a plane (with normal = camDir = -$CameraWorld/Camera3D.global_transform.basis.z
		//var planarDelta = deltaFromMid - deltaFromMid.dot(camDir)*camDir
		var planarDelta = v3Clone(camDir)
		planarDelta.multiplyScalar(-1*deltaFromMid.dot(camDir))
		planarDelta.add(deltaFromMid)

		var screenDelta = new THREE.Vector2(planarDelta.dot(camX),planarDelta.dot(camY))
		//now we have a 2d vector that should be the difference in x,y from the middle of the screen to the point we are interested in
		//get my i,j coords by Math.floor(deltaFromMid.x*FOVDivider/halfScreenWidth) (.y for j)
		var indexVec = new THREE.Vector2(Math.floor(screenDelta.x*FOVDivider/halfScreenWidth),Math.floor(screenDelta.y*FOVDivider/halfScreenWidth))
		//print("star: ",cKey, "'s indexVec before clamping = ", indexVec)
		indexVec.x = clamp(indexVec.x,-FOVDivider,FOVDivider) //have to do it component wise as the vector version doesnt work in gdscript, seems to be working in shader language though
		indexVec.y = clamp(indexVec.y,-FOVDivider,FOVDivider)
		//print("star: ",cKey, "'s indexVec = ", indexVec, ", screenDelta = ", screenDelta)
		//now we have (i,j) which links us to a specific section of the screen
		
		//find the middleVec that corresponds to it's spherePos best
		var myIndex = get_singleIndex_from_indexVec(indexVec) //we do this later anyways
		//find its observedRadius and determine how many adjacent arrays it overlaps that we need to put it in to
		var segmentWidth = 2.0*halfScreenWidth/(2.0*FOVDivider + 1.0)
		//how many of these are needed to fill observedRadius
		//e.g: oR = 6.3 sW = 2 we need 4*sW = 8 to fill oR, oR/sW = 3.15, we want ceiling(oR/sW)
		var adjacentsAffected = Math.ceil(celestialBodies[cKey]["skyRad"]/segmentWidth)
		//we need to put this key in the inSegmentKeys Array for the mainIndex and for each adjacent index
		var iRange = range(-adjacentsAffected, adjacentsAffected+1,1)
		var jRange = range(-adjacentsAffected, adjacentsAffected+1,1)
		for(var iIndex = 0 ; iIndex < iRange.length; iIndex++){ //includes 0,0
			for(var jIndex = 0 ; jIndex < jRange.length; jIndex++){
				var i = iRange[iIndex]
				var j = jRange[jIndex]
				var adjIndexMod = new THREE.Vector2(i,j)
				//var adjIndexVec = indexVec + adjIndexMod
				var adjIndexVec = v3Add(indexVec,adjIndexMod)
//				adjIndex.x = clamp(adjIndex.x,-FOVDivider,FOVDivider)
//				adjIndex.y = clamp(adjIndex.y,-FOVDivider,FOVDivider)
				if(Math.abs(adjIndexVec.x) > FOVDivider || Math.abs(adjIndexVec.y) > FOVDivider){
					continue
				}
				var adjIndex = get_singleIndex_from_indexVec(adjIndexVec)
				inSegmentKeyIndexes[adjIndex].push(keyIndex) //add it to the list for this segment of the screen
				//Which elements of inFOVKeys to use for each segment
			}
		}
		//In segmentKeyIndexes is an array of arrays
		//the first index should be the segment index, and will give an array of Indexes of the celestialBodies in the colour and pos matrix etc that i sent to the shader
		
		
		//We also need to send a list of all the sizes to the GPU so we know when to stop checking
		//as arrays in GPU need to have a definiteSize so we want to stop checking when the remaining elements are useless
	}
	//we want a bigList = [list1,list2,...,list of indexes for each segment]
	//this is because we dont have variable sized arrays in the shader language so it is difficult to make arrays of arrays
	//this is the best way I could find that doesnt waste memory transferring thousands of zero data points.
	
	var bigList = []
	var startEndPairs = []
	//we also need another list of pairs telling us the start and end points
	for(var i=0;i<inSegmentKeyIndexes.length;i++){
		//pass
		//Send the data to the gpu
		//of which elements of inFOVKeys to use for each segment
		if(inSegmentKeyIndexes[i].length == 0){
			startEndPairs.push(-1)
			startEndPairs.push(-1)
			continue //so we can see when we have an empty set
		}
		//if it isnt empty then we append the elements to bigList
		startEndPairs.push(bigList.length)
		for(var j=0;j<inSegmentKeyIndexes[i].length;j++){
			bigList.push(inSegmentKeyIndexes[i][j])
		}
		startEndPairs.push(bigList.length)
	}
	//we now have a really long list with all lists in it and a list of start and end points to know where each list is in the biglist
	//what is a good size for bigList, lets say 1000
	//the start and end point list will have a size of 2*totalSegments
	
	//should I do this all seperately with stars and planets?
	
	

	
	
	//we also need to convert the dictionary to an array structure for the GPU
	//for each element of the dictionary
	//we can make an array
	apply_celestial_data_to_shader(inFOVKeys, bigList, startEndPairs)
	
	//now I have to actually draw it....
}

function get_singleIndex_from_indexVec(indexVec){
	//e.g. (-fovD -> 0)
	return (indexVec.y+FOVDivider)*(2*FOVDivider + 1) + (indexVec.x+FOVDivider)
}

/*
function basicProjectionMatrix(fov_deg,far_plane,near_plane){//all floats
	//https://www.youtube.com/watch?v=ueUMr92GQJc&t=523s
	//at 8:43-45 ish there is this code for shaders, remaking the projection matrix
	var S = 1.0/tan(deg_to_rad(0.5*fov_deg))
	var mfbfmn = (-far_plane)/far_plane-near_plane
	var mfinbfmn = -(far_plane*near_plane)/(far_plane-near_plane)
	var mat1 = Vector4(S,0.0,0.0,0.0)
	var mat2 = Vector4(0.0,S,0.0,0.0)
	var mat3 = Vector4(0.0,0.0,mfbfmn,-1.0)
	var mat4 = Vector4(0.0,0.0,mfinbfmn,0.0)
	
	return [mat1,mat2,mat3,mat4]
}*/

// function getMatrix3BasisFromMatrix4(myMat4){
// 	var newMat3 = new THREE.Matrix3()
// }

function apply_celestial_data_to_shader(inFOVKeys, bigList, startEndPairs){
	//var material = skySphereRef.material //it has a problem with this//yourMesh.material.
	var positionz = []
	var colours = []
	var radius = []
	var solid = []
	var far = []
	var skyRads = []
	var objDirs = []
	var textureIDs = []//initialise_array()
	var lightDirs = []
	
	var cameraTForm = cameraRef.matrixWorld
	var camBasis = new THREE.Matrix3(1,0,0,0,1,0,0,0,1)
	camBasis = camBasis.setFromMatrix4(cameraTForm)
	var camPos = new THREE.Vector3(0,0,0)
	camPos.setFromMatrixPosition(cameraTForm)
	var camX = new THREE.Vector3(1,0,0)
	var camY = new THREE.Vector3(0,1,0)
	var camZ = new THREE.Vector3(0,0,1)
	cameraTForm.extractBasis(camX,camY,camZ)
	//var camDir = -camZ
	var camDir = v3PtMult(new THREE.Vector3(-1,-1,-1), camZ)
	
	
	for( var k=0; k<inFOVKeys; k++){
		var key = inFOVKeys[k]
		positionz.push(celestialBodies[key]["pos"])
		colours.push(celestialBodies[key]["col"])
		radius.push(celestialBodies[key]["rad"])
		solid.push(celestialBodies[key]["solid"])
		far.push(celestialBodies[key]["far"])
		skyRads.push(celestialBodies[key]["skyRad"])
		objDirs.push(celestialBodies[key]["objDirs"])
		textureIDs.push(celestialBodies[key]["type"])
		lightDirs.push(celestialBodies[key]["lightDir"]) //only needed for planets
	}
	//change to
	//yourMesh.material.uniforms.yourUniform.value = whatever;
	/*OLD:
	material.uniforms.positions.value = positions
	material.uniforms.colours.value = colours
	material.uniforms.radius.value = radius
	material.uniforms.solid.value = solid
	material.uniforms.distances.value = far
	material.uniforms.observedRadii.value = skyRads
	material.uniforms.camDir.value = camDir
	material.uniforms.objDirs.value = objDirs
	material.uniforms.texIDs.value = textureIDs
	material.uniforms.lightDirs.value = lightDirs
	
	material.uniforms.camBasis.value = camBasis
	material.uniforms.camPos.value = camPos
	*/
	//skySphereRef.material
	console.log("skySphereRef = "+JSON.stringify(skySphereRef))
	console.log("skySphereRefMaterial = "+JSON.stringify(skySphereRef.material))
	console.log("uniforms = "+JSON.stringify(skySphereRef.material.uniforms))
	skySphereRef.material.uniforms['positions'].value = positionz
	//material.uniforms[ 'uDirLightPos' ].value = 
	skySphereRef.material.uniforms.colours.value = colours
	skySphereRef.material.uniforms.radius.value = radius
	skySphereRef.material.uniforms.solid.value = solid
	skySphereRef.material.uniforms.distances.value = far
	skySphereRef.material.uniforms.observedRadii.value = skyRads
	skySphereRef.material.uniforms.camDir.value = camDir
	skySphereRef.material.uniforms.objDirs.value = objDirs
	skySphereRef.material.uniforms.texIDs.value = textureIDs
	skySphereRef.material.uniforms.lightDirs.value = lightDirs
	
	skySphereRef.material.uniforms.camBasis.value = camBasis
	skySphereRef.material.uniforms.camPos.value = camPos
	
	
	//only once things, can move elsewhere
	//halfScreenWidth
	material.uniforms.halfScreenWidth.value = halfScreenWidth
	material.uniforms.FOVDivider.value = FOVDivider
	//bigList, startEndPairs
	material.uniforms.allSegmentIndexes.value = bigList
	material.uniforms.startEndPairs.value = startEndPairs
	//noise3d
	//material.uniforms.noiseBox", noiseImage3D)


}

//We need to change these so they sort javascript arrays
function sort_inFOVKeys(inFOVKeys){
	//var newFuncDic = inFOVKeys//.duplicate(true)
	//newFuncDic.sort_custom(Callable(self,"sort_celestialBodies_keys"))
	var newFuncDic = inFOVKeys.toSorted(sort_celestialBodies_keys)
	return newFuncDic
}
function sort_celestialBodies_keys(key1,key2){
	//For two elements a and b, if the given method returns true, element b will be after element a in the array
	// if(celestialBodies[key2]["pos"].length() > celestialBodies[key1]["pos"].length()){
	// 	return true
	// }
	// //shouldnt this be the distance to camPos?
	// return false
	var camPos = new THREE.Vector3(0,0,0)
	var distance1 = (celestialBodies[key1]["pos"].sub(camPos)).lengthSq()
	var distance2 = (celestialBodies[key2]["pos"].sub(camPos)).lengthSq()
	return distance2-distance1
}















///continuous re-render
function animate(){
    //essentially game loop
    requestAnimationFrame(animate);

    torus.rotation.x += 0.01;
    torus.rotation.y += 0.03;
    torus.rotation.z += 0.005;
    controls.update();
	//skySphereRef.position = camera.position; #cannot assign read only p[roperty, probably have to use set()
    get_obj_list_for_spaceBox()
	
	renderer.render(scene,camera);
}
for(var i=0;i<100;i++){
    addStar()
}
animate(); //once this is called nothing below gets called?
































