import * as THREE from "three"
import { ECS } from "../miniplex/state"



/* Create an entity */
const player = ECS.world.add({
  position: { x: 0, y: 0, z: 0},
  velocity: { x: 0, y: 0, z: 0},
  health: { current: 100, max: 100 },
  faction: 0
})

/* Create another entity *//*
const enemy = world.add({
  position: { x: 10, y: 10 },
  velocity: { x: 0, y: 0 },
  health: { current: 100, max: 100 },
  faction: 1
})
*/

function create_enemy_components(){
    var amount= 10
    var enComponents = []
    for(var i=0;i<amount;i++){
        var newPos = {x: 2*i, y:1, z:2*i}
        var enemyComp = {
            position: newPos,
            velocity: { x: 0, y: 0, z: 0},
            health: { current: 100, max: 100 },
            faction: 1
          }
          enComponents.push(enemyComp)

          
    }
    return enComponents
}

function add_component_list(compList){
    for (var i=0;i<compList.length;i++){
        var enemyComp = compList[i]
        ECS.world.add(enemyComp)
    }
}

function return_enemy_JSX(myPos, myKey){
    

    return(<RigidBody type="fixed" name="floor" key={myKey}><Box position={[myPos.x,myPos.y,myPos.z]} args={[1,1,1]}><meshStandardMaterial color="springgreen" /></Box></RigidBody>)
}


function get_enemy_JSXs(){
    //now we have to somehow use this data to render a scene
    add_component_list(create_enemy_components())
    const posEntities = world.with("position")
    var newPos = new THREE.Vector3()
    var enemyJSXList = []
    for (const thisEntity of posEntities) {
        var myPos = thisEntity.position
        newPos.set[position.x,position.y,position.z]
        var myKey = ECS.world.id(entity)
        enemyJSXList.push(return_enemy_JSX(myPos, myKey))
      }
    return enemyJSXList
}


export const miniplexTest = () => {

    return(
        <>
        <ambientLight intensity={0.5} />
        <OrbitControls />


        <RigidBody type="fixed" name="floor">
            <Box position={[1,1,0]} args={[10,1,10]}>
                <meshStandardMaterial color="springgreen" />
            </Box>
        </RigidBody>
        {get_enemy_JSXs()}
        

        </>
    )
}