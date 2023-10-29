import { Suspense, useMemo, useState , useRef} from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import './App.css'
import { Physics } from '@react-three/rapier';
//import { useFrame } from '@react-three/fiber';
//import { Suspense } from '@react-three/rapier';
import { tw, css } from 'twind/css'
import { Flex, Box } from '@react-three/flex'
//components:
import { Canvas, useFrame } from '@react-three/fiber';
import { Experience } from './components/Experience';
import { RBody } from './components/RBody';
import { miniplexTest } from './components/miniplexTest';
import { KeyboardControls } from '@react-three/drei';
import { jsonWorld } from './components/jsonWorld';
import { Enemies } from './components/Enemies';
import { LevelA } from './components/LevelA';
import { Blob } from './components/Blob';
import { StarSphere } from './components/starSphere';
import { OrbitControls, CycleRaycast, Html } from '@react-three/drei';
import {InstancedBoxes} from './components/Instancing';

import { Player } from './components/Player';
import { SkySphere } from './components/skySphere';
import { Color,MathUtils } from "three";
//import { MathUtils } from "three";

import SimplexNoise from "./lib/simplexNoise.js";
import HexGrid from './lib/HexGrid.js'
const simplexNoise = new SimplexNoise(Math.random);
const hex = new HexGrid();

// export const Controls = {
//   forward: "forward",
//   back: "back",
//   left: "left",
//   right: "right",
//   jump: "jump",
// }

// export const keyboardMap = [
//   { name: "forward", keys: ["ArrowUp", "KeyW"] },
//   { name: "backward", keys: ["ArrowDown", "KeyS"] },
//   { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
//   { name: "rightward", keys: ["ArrowRight", "KeyD"] },
//   { name: "jump", keys: ["Space", "KeyE"] },
//   { name: "run", keys: ["Shift"] },
//   // Optional animation key map
//   { name: "action1", keys: ["1"] },
//   { name: "action2", keys: ["2"] },
//   { name: "action3", keys: ["3"] },
//   { name: "action4", keys: ["KeyF"] },
// ];
// export const keyboardMap = {
//   { name: "forward", keys: ["ArrowUp", "KeyW"] },
//   { name: "backward", keys: ["ArrowDown", "KeyS"] },
//   { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
//   { name: "rightward", keys: ["ArrowRight", "KeyD"] },
//   { name: "jump", keys: ["Space"] },
//   { name: "run", keys: ["Shift"] },
//   // Optional animation key map
//   { name: "action1", keys: ["1"] },
//   { name: "action2", keys: ["2"] },
//   { name: "action3", keys: ["3"] },
//   { name: "action4", keys: ["KeyF"] },
// };


import fragmentShader from './shaders/tut3FragShad.js';//3=blob
import vertexShader from './shaders/tut3VertShad.js';

var playerFaction = 0
var chosenTileID = 0
var chosenThing = [0,-1]
var menuContext = 0;
var lastMenuContext = 0;
//var gameState = 0
//var  [gameState, setGameState] = useState("ParentString")
// function setGameState(newGameState){
//   gameState = newGameState

// }
const gameStateIntToStr = {
  0 : "default",//select something to do state (or look around the world)
  1 : "orders",//give a unit orders by selecting a point in the world to "walk" to
  2 : "buildMenu",//choose task for structure
}

function remove_array_element(array,element){
  console.log("remove_array_element function")
  var newArray = array.map((x) => x);
  const index = newArray.indexOf(element);
  console.log("before")
  console.log(newArray)
  if (index > -1) { // only splice array when item is found
    newArray.splice(index, 1); // 2nd parameter means remove one item only
  }
  //var newArray = structuredClone(array)
  // console.log(array)
  // console.log("element = "+element)
  // console.log("finalArray = ")
  console.log("after")
  console.log(newArray)
  return newArray
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//              SETTING UP WORLD OBJECTS
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////


var worldTiles = {}
var tileDefault = {
  "q" : 0,//cube coords
  "r" : 0,
  "noise" : 0,
  "posX" : 0,
  "posY" : 0,
  "entityID":-1, //only 1 per tile
  "structID":-1, //if -1 then it is not occupied (//structID is 8 chars, structureID is more)
  "resourceData":{},//trees, mineral etc
}
var worldInfo = {
  "worldRadius":10,
  "totalGridSize":441,
}//so we only have to change worldRadius and NOT totalGridSize
worldInfo.totalGridSize = (2*worldInfo.worldRadius+1)*(2*worldInfo.worldRadius+1)


function get_inital_world_data(){
  const worldRadius = worldInfo.worldRadius
  const totalGridSize = (2*worldRadius+1)*(2*worldRadius+1)
  const hexRad = 0.5
  const sqrtThree = Math.sqrt(3)
  //use cube coordinates or axial
  //https://www.redblobgames.com/grids/hexagons/
  //3 axes q,r,s; q+r+s=0
  //loop(for all q)loop(for all r){s=-r-q}{}
  
  var i=0
  for(var q=-worldRadius;q<worldRadius+1;q++){
    for(var r=-worldRadius;r<worldRadius+1;r++){
      const s = hex.getLastCubeCoord(q,r)
      const tileKey = String(i)
      //const intID = parseInt(tileKey)
      worldTiles[tileKey] = structuredClone(tileDefault)
      worldTiles[tileKey]["q"] = q
      worldTiles[tileKey]["r"] = r
      const noiseScale = 0.05
      worldTiles[tileKey]["noise"] = simplexNoise.noise2D(noiseScale*q,noiseScale*r)
      const myPos = hex.axialToFlatPos(q,r, hexRad)
      worldTiles[tileKey]["posX"] = myPos[0]
      worldTiles[tileKey]["posY"] = myPos[1]
      console.log("ID="+i+" gridPos[q,r]=["+q+","+r+"]")
      const newID = hex.IDFromGridPos([q,r], worldInfo.worldRadius)

      console.log("getIDFromGridPos="+newID)
      i++
    }
  }
  //(3,2)=(q,r) => is the vector sum of 3*q and 2*r as basis vectors

}


function get_inital_random_entity_data(){
  const worldRadius = worldInfo.worldRadius
  var i=0
  for(var q=-worldRadius;q<worldRadius+1;q++){
    for(var r=-worldRadius;r<worldRadius+1;r++){
      if(Math.random()*10 < 2){
        //spawn entity on that tile
        spawnEntity(0, 0, [q,r])
        i++
      }
    }
  }
  
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////



//////////////////////////////////////////////////////////////////////////////////////////
//              Game Data Objects
//////////////////////////////////////////////////////////////////////////////////////////
//make UI to add entities and structures to scene




var trees = {}
//populate an array full of trees for different tiles
const treeDefault = {
  "type" : 0,
  "amount" : 1,
  "gridPos" : [0,0]
}




var entities = {}//all the units/entities in the world
const entityDefault = {
  "instID" : -1,
  "name" : "entityInstX",
  "gridPos":[0,0],
  "modelID": 0,
  "faction":0,
  "unitTypeID":0,
  //level:0,//do with stat mult
  "statMult":{
  //e.g. "atk" : 1.2,
  /*so we can loop through this object and see if we need to adjust the value of any of our stats*/
  },
  //"haveMoved":false,
  "haveAttacked":false,
  "MP":100, //movement points we get more each turn.//should br a max though
  "specialAtkAmmo" :[],//[1,1,...],/*must be same size as the unitType.specialAtkIDs array.*/
  "HP":100,//unitType.maxHP,
  "sleeping":false,//so we can skip turn
  "tasks":[]//we need to record what the player wants us to do.
}

var unitTypes = {
  "0":{//we need a default to test code
    "MPPerTurn":10,
    "maxMP":200,//maximum amount of movement points
    "maxHP": 100,
    "atk": 1,
    "def": 1,
    "range": 1,
    "accuracy":0.9,
    "specialAtkIDs":[],//add special attacks /
    //will need an object elsewhere to get data on their effects.
    "weaknessID": 0,// for scissorspaperrock things. (Need to represent strengths and weakness somehow)
    "terrainType": 0, // is it a land unit, sea unit or air unit etc.
    "name" : "defaultUnit"
  }
}//static info on various unitTypes
const unitTypeDefault ={
  //for each unitTypeID we have extra data that doesn't change
  "MPPerTurn":10,
  "maxMP":200,//maximum amount of movement points
  "maxHP": 100,
  "atk": 1,
  "def": 1,
  "range": 1,
  "accuracy":0.9,
  "specialAtkIDs":[],//add special attacks /
  //will need an object elsewhere to get data on their effects.
  "weaknessID": 0,// for scissorspaperrock things. (Need to represent strengths and weakness somehow)
  "terrainType": 0, // is it a land unit, sea unit or air unit etc.
  "name" : "nullUnit"

}

var structures = {}
const structureDefault = { //default for instance based information on structures
  "typeID":0,//for static info
  //below is for instance specific info
  "name":"structX",
  "faction":0,
  "HP":100,
  "maintenance":100,// slowly ticks down
  "garrison":[],// entityIDs in town. 
  "currentTaskID":[],
  "doingTask": false,
  "underSiege": false,
  "inventory":{
    //specialAtkID:ammo
  },//for restocking
  //we will need stats for speed at which we do tasks.
  "statMult":{
    //e.g. "atk" : 1.2,
    /*so we can loop through this object and see if we need to adjust the value of any of our stats*/
    },

  "modelID" : 0,
  "sleeping":false,
  "tasks":[],//we need to record what the player wants us to do.
}


var structureTypes = {
  "0":{
    "maxHP":100,
    "def":1,
    "atk":1,
    "range":1,
    "production":1,
    "taskData":{},
    "name":"defaultStructure"
  }
}//Holds static information about structures
//I should be the person populating it
const structureTypeDefault={
  "maxHP":100,
  "def":1,
  "atk":1,
  "range":1,
  "production":1,
  "taskData":{},
  "name":"nullStruct"

}

//////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//    Game Functions         Data Manipulation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*Along with the instanceID we should also pass the context, that is, which type of thing we are selecting. Or from which dictionary/instance is the ID for*/

const typeID_to_word = {
  0:"structure",
  1:"entity",
  2:"land"
}




function moveEntityToTile(entityID, newGridPos){

  const oldGridPos = entities[String(entityID)].gridPos
  //change info in entityDic
  entities[String(entityID)].gridPos = newGridPos
  
  const oldTileID = hex.IDFromGridPos(oldGridPos, worldInfo.worldRadius)
  const newTileID = hex.IDFromGridPos(newGridPos, worldInfo.worldRadius)
  
  //remove entity from worldTiles[String(oldTileID)].entities[]
  //add entity to worldTiles[String(newTileID)].entities[]
  worldTiles[String(oldTileID)].entityID = -1;//no one is here now
  worldTiles[String(newTileID)].entityID = entityID;
  
}
  // If we pass different props to the child it should notice when they change and render differently 
  // We need an instance for units too.
  
  
function create_structure(structureTypeID, faction, gridPos){
  //make a default structure
  //populate bits we can
  const structID = Object.keys(structures).length
  structures[String(structID)] = structuredClone(structureDefault)
  structures[String(structID)].gridPos = gridPos
  structures[String(structID)].typeID = structureTypeID
  //Health = maxhealth
  structures[String(structID)].HP = structureTypes[String(structureTypeID)].maxHP
  //others are probably needed too

}
  
  
function spawnEntity(unitTypeID, faction, gridPos){
  const entityID = Object.keys(entities).length
  const entityKey = String(entityID)
  worldTiles[String(hex.IDFromGridPos(gridPos, worldInfo.worldRadius))].entityID = entityID
  entities[entityKey] = structuredClone(entityDefault)
  entities[entityKey].unitTypeID = unitTypeID
  entities[entityKey].instID = entityID//it might change but it starts as our ID
  entities[entityKey].faction = faction
  entities[entityKey].gridPos = gridPos
  //entities[entityKey].MP = 1
}

// function getTileIDFromGridPos(gridPos){
//   return gridPos[0] + ((2*worldInfo.worldRadius)+ 1)*gridPos[1]
// }//TEST



//We need a button that we can click to select the next entity or structure that hasnt given orders
//function next_thing_that_needs_orders(){
const next_thing_that_needs_orders = () => {
  const faction = playerFaction
  console.log("finding next available thing")
  var selectedStructure = false
  var selectedID = -1
  //check all structures I control
  //get the next one that hasnt had an issue ordered
  var structureKeys = Object.keys(structures)
  var entityKeys = Object.keys(entities)

  const selectedType = typeID_to_word[chosenThing[0]]
  if(selectedType === "structure"){ //should do it the reverse way
    structureKeys = remove_array_element(structureKeys,String(chosenThing[1]))
  }
  else if(selectedType === "entity"){ 
    entityKeys = remove_array_element(entityKeys,String(chosenThing[1]))
  }
  for(const structKey of structureKeys){
    if(structures[structKey].faction != faction){console.log("not right faction");continue}
    if(structures[structKey].sleeping == true){console.log("is sleeping");continue}
    if(structures[structKey].doingTask == true){console.log("already busy");continue}
    //if we get to this point it means we need to give this structure a task
    selectedStructure = true
    selectedID = parseInt(structKey)
    chosenThing = [0,selectedID]
    return chosenThing
  }
  //Now we need to do the same for entities
  console.log("entityKeys = ")
  console.log(entityKeys)
  for(const entityKey of entityKeys){
    console.log("entityID = "+entityKey)
    if(entities[entityKey].faction != faction){console.log("not right faction");continue}
    if(entities[entityKey].sleeping == true){console.log("is sleeping");continue}
    if(entities[entityKey].haveAttacked == true){console.log("has attacked already");continue} //if above MP then we cant retreat after attacking
    if(entities[entityKey].MP <= 0){console.log("out of movement points");entities[entityKey].MP = 0;continue}
    
    //if we get to this point it means we need to give this structure a task
    selectedStructure = false
    console.log("entityKey = "+entityKey)
    selectedID = parseInt(entityKey)
    chosenThing = [1,selectedID]
    return chosenThing
  }
  if(selectedID === -1){
    //dont change chosenThing
    return chosenThing
  }

  if(selectedStructure == true){
    chosenThing = [0,selectedID]
  }else{
    chosenThing = [1,selectedID]
  }

  return [selectedStructure,selectedID]
} //if return[1] == -1 it means no units/structures were found that need orders
  //if return[1] >= 0 we have found an ID, if return[0] == true it means this ID refers to a structure (else entity)

////////////////////////////////////////////////////////////////////////////////////////////////////////////

get_inital_world_data()
//NEED to check gridPos
get_inital_random_entity_data()
console.log("worldTiles")
console.log(worldTiles)
console.log("entities")
console.log(entities)



function App() {
  var  [gameState, setGameState] = useState(2)
  //setGameState(0)
  var extraMessage = ""

  function get_contextual_UI(){
    //return a JSX element that is the HTML layout for the different buttons needed
    const selectedType = typeID_to_word[chosenThing[0]]
    var UIContextualButtonsJSX = <></>
    if(selectedType === "entity"){
      UIContextualButtonsJSX = (
      <>
      <button type="button" onClick={setUp_selectMovePos} className="UI_contextual" id="moveUnit">Move Unit</button>
      </>
      )
    }
    else if(selectedType === "structure"){
      UIContextualButtonsJSX = (
      <>
      <button type="button" onClick={setUp_chooseTaskForStructure} className="UI_contextual" id="openBuildMenu">building menu</button>
      </>
      )
    }
    // else{
  
    // }
  
    return (
        <div id="uiTest">
          <p>UI for {selectedType} {chosenThing[1]}</p>
          <p>{extraMessage}</p>
          <button type="button" onClick={next_thing_that_needs_orders} className="UI_button" id="nextButton">Next Thing!</button>
          {UIContextualButtonsJSX}
        </div>
  
    )
  }
  
  
  const setUp_selectMovePos = () => {
    console.log("we have to choose a spot to move to")
    setGameState(1)//orders
    return
  }
  
  const setUp_chooseTaskForStructure = () => {
    console.log("choose a task for a structure to do")
    setGameState(2) //structure
    return
  }
  

  // const map = useMemo(() => [
  //   { name: Controls.forward, keys:["ArrowUp", "KeyW"] },
  //   { name: Controls.back, keys:["ArrowDown", "KeyS"] },
  //   { name: Controls.left, keys:["ArrowLeft", "KeyA"] },
  //   { name: Controls.right, keys:["ArrowRight", "KeyD"] },
  //   { name: Controls.jump, keys:["Space"] },
  // ],[]);
  
  
  //const map = useMemo(() => keyboardMap,[]);


  // const BaseShaderTest = () => {
  //   //const mesh = useRef();
  //   return (
  //     <mesh position={[0,2,0]}>
  //     <sphereGeometry args={[1]} />
  //     <shaderMaterial
  //       fragmentShader={fragmentShader}
  //       vertexShader={vertexShader}
  //     />
  //   </mesh>
  //   );
  // };
  // const MovingPlane = () => {
  //   // This reference will give us direct access to the mesh
  //   const mesh = useRef();
  
  //   const uniforms = useMemo(
  //     () => ({
  //       u_time: {
  //         value: 0.0,
  //       },
  //       u_colorA: { value: new Color("#FFE486") },
  //       u_colorB: { value: new Color("#FEB3D9") },
  //     }), []
  //   );
  
  //   useFrame((state) => {
  //     const { clock } = state;
  //     mesh.current.material.uniforms.u_time.value = clock.getElapsedTime();
  //   });
  
  //   return (
  //     <mesh ref={mesh} position={[0, 2, 0]} rotation={[-Math.PI / 2, 0.5, 1]} scale={1.5}>
  //       <planeGeometry args={[1, 1, 16, 16]} />
  //       <shaderMaterial
  //         fragmentShader={fragmentShader}
  //         vertexShader={vertexShader}
  //         uniforms={uniforms}
  //         wireframe={false}
  //       />
  //     </mesh>
  //   );
  // };


  const  [message, setMessage] = useState("ParentString")



  function clickFunction(typeID, instID){
    setMessage("we just clicked"+typeID_to_word[typeID]+String(instID))
    chosenTileID = instID
    const tileKey = String(instID)
    worldTiles[tileKey].noise += 0.1//TEST
  }

  function chooseTileForTask(typeID, instID){
    //EG move unit
    const entityID = chosenThing[1]
    const tileKey = String(instID)
    //const entityKey = String(entityID)
    //BAD
    //entities[entityKey].gridPos = [worldTiles[tileKey].q,worldTiles[tileKey].r]
    const currentTile = entities[String(entityID)].gridPos
    const finalTile = [worldTiles[tileKey].q,worldTiles[tileKey].r]
    const newPath = find_path_on_grid_with_dijkstra_algorithim(currentTile, finalTile)
    console.log("new dijkstra path = ")
    console.log(newPath)
    moveEntityToTile(entityID, finalTile)
    entities[String(entityID)].MP = 0
    setGameState(0)//"default"
    //GOOD - give AI a task to walk to that tile (might be multiple steps, show the steps),
    // do a contextual interaction on that tile, e.g. attack or garrison, then
    // tell the system that this AI has done its thing (reduce MP)
    //
  }

  var selectPos = [0,10,0]
  function upSelectPos(){
    selectPos[1] = selectPos[1]+0.5
  }

  var jsxDiv = (
  <div display="block" 
    className={tw(
      css`
        @apply absolute inset-0 pt-20 md:px-14 text-menu-text z-10 bg-black bg-opacity-40 md:bg-transparent;
        @media screen and (-webkit-min-device-pixel-ratio: 0) and (min-resolution: 0.001dpcm) {
          -webkit-transform: rotate3d(0, 1, 0, 357deg);
        }
      `
    )}
  >
    <div className="flex flex-col md:flex-row h-4/6 overflow-y-scroll no-scrollbar focus:outline-none">
      <p>message is {message}</p>
    </div>
  </div>
)
  

  function get_contextual_CanvasJSX(){
    const gameStateStr = gameStateIntToStr[gameState]
    const lightIntensity = 0.5
    var canvasJSX = <></>
    if (gameStateStr === "orders"){
      extraMessage = "where should the unit move?"
      //I can change the function thats called on InstancedBoxes to instead move the unit to that spot
      canvasJSX = (
        <>
          <ambientLight intensity={lightIntensity} />
          <InstancedBoxes
            clickFunction={chooseTileForTask}
            worldTiles={worldTiles}
            worldInfo={worldInfo}
            entities={entities}
          />
          <OrbitControls/>
        </>
      )
    }
    else if (gameStateStr === "buildMenu"){
      extraMessage = "choose a task for this structure"
      //make a menu appear that we can click
      //its okay to overlay a new DOM here and lose mouse input underneatyh as long as we have an exit button
      canvasJSX = (
        <>
          <ambientLight intensity={lightIntensity} />
          <InstancedBoxes
            clickFunction={clickFunction}
            worldTiles={worldTiles}
            worldInfo={worldInfo}
            entities={entities}
          />
          {/* <OrbitControls/> */}
        </>
      )
    }
    else{//if (gameStateStr === "default"){
      extraMessage = "in default game state"
      canvasJSX = (
        <>
          <ambientLight intensity={lightIntensity} />
          <InstancedBoxes
            clickFunction={clickFunction}
            worldTiles={worldTiles}
            worldInfo={worldInfo}
            entities={entities}
          />
          <OrbitControls/>
        </>
      )
    }
    return canvasJSX
  }

  const menuExitButton = () => {
    gameState=0//go to default game mode
  }
  const menuBackButton = () => {
    menuContext=lastMenuContext//go to previous menu
  }
  const setUp_chooseBuildingTask = () => {
    console.log("insert building tasks here")
  }
  
  function get_menu_JSX(){
    var menuOverlayJSX = <></>
    if (gameState === 2){//buildMenu
      console.log("in menu game state")
      menuOverlayJSX = (
      <>
        <div className="overlayMenu" id="buildMenu">
  
          <div id="menuHeader">
            <p>Build Menu</p>
            <button type="button" className="headerButton" id="exitButton" onClick={menuExitButton}>Exit Menu</button>
            <button type="button" className="headerButton" id="backButton" onClick={menuBackButton}>Previous Menu</button>
          </div>
  
          <div id="menuBody">
            <button type="button" className="buildMenuButton" id="chooseBuildingTaskMaster" onClick={setUp_chooseBuildingTask}>Choose Task</button>
          </div>
  
        </div>
      </>
      )
    }
    return menuOverlayJSX
  }


  const GAME_JSX = get_contextual_CanvasJSX()
  const UI_JSX = get_contextual_UI()
  const menuOverlayJSX = get_menu_JSX()
  return (
    <>
    <Canvas shadows camera={{position:[-10,10,0]}} intensity={0.4}>
      {GAME_JSX}
    </Canvas>
    {UI_JSX}
    {menuOverlayJSX}
    </>
  )


}
export default App


















// WebCiv TODO: 29 Oct
// 1)Make a flood fill algorithm to find a path to target 
// Probably have to re run it every turn
// 2)Make a movement point relative to height system.
// 3)make a contextual menu for structures and options and info etc
// 4) Make "animation" gameState to move units. (Should we include an option to skip, for fast players)
// 5)Make tile overlay to visualise path
// 6)Make attack and defend system.
// 7)Make contextual selection when we click a tile, and show on the UI when we hover (attack or move or cantMove).
// 8)Make game options menu
// 9)Make save and load system in JSON
// 10)move static dictionaries to external file
// 11)

//(1(a))
/* could get my code from godot and convert or just write a new*/

//(/1)





//((3)a)
/*we need a way of telling the menu what to load.
menu should be a game state.
but menu state could be a seperate object*/





//(/3)


// 5) load an opaque mesh overlay witnh instancing
// or make it an arrow or dotted line that grows to cover all the tiles until we change direction. need a seprrate image/mesh for the attack/move on final tile
// obstacles:
// structures and entities that are not in yours ir an allies faction are impasssable
// structs and ents that are are allowed to be walked past but not la.ded on at the end of your turn. we need to select the tile to move/attack there anyways so we can do this check before doing pathfinding.
// entities are the same 
// wheb we hover over a tile to move to.
// check
// worldTiles[tileKey] 

// ((4)a)
// when changing gameState to anim
// we should chwck if user hasbt turned off that option


// if (gameState === 3){/*animate
//   each frame we send a slightly adjusted vec3 position ti the mesh eaxh turn, to look like continous movement
//   each step is speed*basisVecror*/
//   //that is each one has a dir of +-1*[q,r,s] which is 6 values for 3ach 6 adjacent tiles
//   //a path is a collection of targetPoints that are straight lines from each other

// }







//NEED TO CONVERT DIJKSTRA TO WORKING WITH JAVASCRIPT AND TO WORK IN THE CONTEXT OF THE NEW GAME WORLD AND HEX MAP

function travelDifficulty(currentGridPos, nextGridPos){
  console.log("travelDifficulty function")
  console.log(currentGridPos+ " to ")
  console.log(nextGridPos)
  const currentGridID = hex.IDFromGridPos(currentGridPos, worldInfo.worldRadius)
  const nextGridID = hex.IDFromGridPos(nextGridPos, worldInfo.worldRadius)
  console.log(currentGridID+ " to "+ nextGridID)
  
  return Math.abs( worldTiles[currentGridID].noise - worldTiles[nextGridID].noise )
	//return Math.abs( worldTiles[hex.IDFromGridPos(currentGridPos, worldInfo.worldRadius)].noise - worldTiles[hex.IDFromGridPos(nextGridPos, worldInfo.worldRadius)].noise )
}
function find_path_on_grid_with_dijkstra_algorithim(initialVertex, finalVertex){ //vertexGridSize is sideVertices
  console.log("find_path_on_grid_with_dijkstra_algorithim from ",initialVertex," to ",finalVertex)
  //pass
  //// Dijkstra’s Algorithm
  //// Set each node's position to infinity, I am doing this as I run into them in the while loop
    //for each node in the graph
  function gridPosToStrKey(myGridPos){
    return String(initialVertex[0]) + "," + String(initialVertex[1])
  }
  
  function myArraySorter(a,b){
    //a and b are arrays with 2 elements
    //we want it to sort so the lowest distance is at the back of the array (so we pop back not pop front so we dont need to re-index)
    if (a[0] > b[0]){
      return -1
    }
    else if ((a[0] === b[0])){
      return 0
    }
    else{
      return 1
    }
  }
  
  function addArrays(arrA,arrB){
    var newArray = []
    for(var i=0;i<arrA.length;i++){
      newArray.push(arrA[i]+arrB[i])
    }
    return newArray
  }

  var data = {} //declared in while loop
  var dataDefault = {
    "distanceFromStart" : Infinity,
    "directionToStart" : null
  }
  //	for vertexKey in vertexData.keys():
  //		//set the node's distance to infinity
  ////		vertexData[vertexKey].dijkstra.distanceFromTown = dicData.config.infinity
  ////		//already set by default
  ////		// set the node's parent to none
  ////		vertexData[vertexKey].dijkstra.directionToTown = null
  //		data[vertexKey] = structuredClone(dataDefault)
  var directionsDic = { //THIS WILL NOT WORK THE SAME AS THE OTHER ONE
    0 : [0,0],
    1 : [-1,0],
    2 : [0,-1],
    3 : [1,-1],
    4 : [1,0],
    5 : [0,1],//?
    6 : [-1,1],//?
  }
  const axialDirectionsArray = [ //for enum
    [0,0],[-1,0],[0,-1],[1,-1],[1,0],[0,1],[-1,1]
  ]
  const adjacentHexCubeMods = [
    [-1,0,1],[0,-1,1],[1,-1,0],[1,0,-1],[0,1,-1],[-1,1,0]
  ]//equaivalent to below
  const adjacentHexAxialMods = [
    [-1,0],[0,-1],[1,-1],[1,0],[0,1],[-1,1]
  ]
    
    //// Create an unexplored set
    //let the unexploredSet equal a set of all the nodes
  var unexploredVertices = [] // vertexData.keys().duplicate(true) //these are strings...
  var exploredVertices = []
  //	for initialVert in initialVertices:
  //		//var index = sideVertices*initialVert[0] + initialVert[1]
  //		vertexData[String(initialVert[0] + "," + initialVert[1])].dijkstra.distanceFromTown = 0
  //		vertexData[String(initialVert[0] + "," + initialVert[1])].dijkstra.directionToTown = dicData.directionsEnum[Vector2(0,0)]
  //
  //		unexploredVertices.push([0, initialVert])
    data[String(initialVertex[0] + "," + initialVertex[1])] = structuredClone(dataDefault)
    data[String(initialVertex[0] + "," + initialVertex[1])]["distanceFromStart"] = 0
    data[String(initialVertex[0] + "," + initialVertex[1])]["directionToStart"] = 0//=axialDirectionsArray.indexOf([0,0])//directionsEnum[[0,0]]
    var initialElement = [0, initialVertex]
    unexploredVertices.push(initialElement)
    
    var endCondition = false
    console.log("about to start while loop")
    while(!endCondition){//while the unexploredSet is not empty //this only works for fully connected maps
      //console.log("in while loop")
      //// Get the current node
      //do I have to sort the vertices for every loop?
      //unexploredVertices.sort_custom(Callable(MyCustomSorter, "sort_descending")) //seems very inefficient, we choose sort_descending so we can pop_back
      console.log("before sort")
      console.log(unexploredVertices)
      unexploredVertices.sort(myArraySorter)
      console.log("unexploredVertices")
      console.log(unexploredVertices)
      var current_decision_and_vertex = unexploredVertices[unexploredVertices.length-1]
      unexploredVertices = unexploredVertices.toSpliced(unexploredVertices.length-1,1)
      //unexploredVertices.splice(unexploredVertices.length-1,1)
      //var current_decision_and_vertex = unexploredVertices.pop();//_back()//    let the currentNode equal the node with the smallest distance
      console.log("after pop")
      console.log(unexploredVertices)
      console.log("current_decision_and_vertex = ")
      console.log(current_decision_and_vertex)
      var currentVertex = current_decision_and_vertex[1]
      console.log("currentVertex = "+ currentVertex)
      exploredVertices.push(currentVertex)
      data[String(currentVertex[0] + "," + currentVertex[1])]["distanceFromStart"] = current_decision_and_vertex[0]  //record the distance for later
      
      
      for (const dir of adjacentHexCubeMods){// for each neighbor (still in unexploredSet) to the currentNode
        //var neighbour = currentVertex + dir
        var neighbour = addArrays(currentVertex,dir)
        //if not inBounds(neighbour):
        //if (!worldData.custom_inBounds(neighbour, vertexGridSize)){
        if (!worldTiles.hasOwnProperty(hex.IDFromGridPos(neighbour,worldInfo.worldRadius))){
          continue
        }
        //        // Calculate the new distance
        var newDistance = current_decision_and_vertex[0] + travelDifficulty(currentVertex, neighbour)
        if (exploredVertices.includes(neighbour)){
          continue
        }
        if (!data.hasOwnProperty(String(neighbour[0] + "," + neighbour[1]))){
          data[String(neighbour[0] + "," + neighbour[1])] = structuredClone(dataDefault)
        }
        var oldDistance = data[String(neighbour[0] + "," + neighbour[1])]["distanceFromStart"]
        if (oldDistance == Infinity){
          unexploredVertices.push([oldDistance, neighbour])
        }
        if (newDistance < oldDistance){
          data[String(neighbour[0] + "," + neighbour[1])]["distanceFromStart"] = newDistance
          data[String(neighbour[0] + "," + neighbour[1])]["directionToStart"] = axialDirectionsArray.indexOf([-dir[0],-dir[1]])//set neighbor's parent to currentNode
          console.log("unexploredVertices = ")
          console.log(unexploredVertices)
          console.log("element to find = ")
          console.log([oldDistance, neighbour])
          //maybe unexploredVertices is only saving one entry not multiple
          const oldArrayElement = [oldDistance, neighbour]
          var neighbourIndex = unexploredVertices.indexOf(oldArrayElement)
          
          
          //THIS ONE THROWS AN ERROR
          //console.log(neighbourIndex)
          console.log("unexploredVertices["+neighbourIndex+"]")
          //says neighbourIndex is -1, probably from indexOf throwing an error
          console.log(unexploredVertices[neighbourIndex])
          unexploredVertices[neighbourIndex][0] = newDistance
        }
      }
      //check if we should end
      if (currentVertex[0] == finalVertex[0] && currentVertex[1] == finalVertex[1]){
        endCondition = true //reached the end
        //console.log("reached end")
      }
      if (unexploredVertices.size() <= 0){
        endCondition = true
        //console.log("ran out of vertices to explore")
      }
    }
    //console.log("while loop ends")
    
    //while loop ends
    //now actually get path
    //now the while loop is finished we need to reconstruct a path from the startNode to endNode
    var tempPath = []
    var endTrace = false
    var currentVertex = finalVertex
    tempPath.push(currentVertex)
    while (endTrace == false){
      //var prevVertex = currentVertex + directionsDic[ data[String(currentVertex[0]+ "," +currentVertex[1])]["directionToStart"] ]//previousNodes[currentNode]
      var prevVertex = addArrays(currentVertex,directionsDic[ data[String(currentVertex[0]+ "," +currentVertex[1])]["directionToStart"] ])//previousNodes[currentNode]
      //console.log("previousVertex = ", prevVertex)
  //		if prevVertex == null:
  //			endTrace = true
  //			//console.log("tempPathFind has failed")
  //			tempPath = []
      if (prevVertex == initialVertex){
        //console.log("tempPathFind is a success")
        endTrace = true
      }
  //			tempPath.push(prevVertex)
  //			currentNode = prevVertex
  //		else: //valid middle tempPath element
  //			tempPath.push(prevVertex)
  //			currentNode = prevVertex
      tempPath.push(prevVertex)
      currentVertex = prevVertex
    }
    //path is from end to start, we need to reverse it so it goes from start to end
    //console.log("tempPath = ", tempPath)
    //var tempPath = path.duplicate()
    //var vertexPath = worldData.array_invert(tempPath)
    var vertexPath = tempPath.reverse()
    // var stringPath = []
    // for(const vert of vertexPath){
    //   stringPath.push(String(vert[0]+ "," +vert[1]))
    // }
    //path = path.reverse() //THIS IS ILLEGAL
    //console.log("stringPath = ", stringPath)
    return vertexPath
  }




//we want to do all things then have ai do their things then have a button appear to end all turns
function end_of_all_turns(){
  for(entityKey of Object.keys(entities)){
	  //restore values
	typeID = entities[entityKey].unitTypeID
 	//if healthy
	entities[entityKey].HP += entities[entityKey].HPperTurn
        if(climbing){
		//if we are flagged as climbing then we save our MP until we hav3 enough to climb a hill
	        entities[entityKey].MP += entities[entityKey].maxMP
	}else{
		entities[entityKey].MP = entities[entityKey].maxMP
	}
  }
	
  for(structKey of Object.keys(structures)){
	  if( structures[structKey].doingTask){//FIX
		  //add production to task
		  //see if task is complete
	  }
	  //restore some health
  }

		  




}






