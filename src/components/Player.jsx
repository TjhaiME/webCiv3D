import Ecctrl, { EcctrlAnimation } from "ecctrl";
//convert player to EC-ctrl
//https://github.com/pmndrs/ecctrl
import { Box, OrbitControls, Sphere, Torus, useKeyboardControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { RigidBody, quat} from '@react-three/rapier';
import { useRef, useState } from 'react'

export const Player = () => {
    //const [hover, setHover] = useState(false);
    //const cube = useRef();
    //const kicker = useRef();
   // const [start,setStart]= useState(false);
    // const jump = () => {
    //     //console.log("trying to jump, isOnFloor.current = "+isOnFloor.current)
    //     if (!isOnFloor.current){
    //         //console.log("CANT JUMP: not on floor")//for some reason having this console log here caused wakeUp to work better
    //         return
    //     }
    //     //cube.current.wakeUp()//sleeping RBs dont respond to impulses
    //     //cube.current.applyImpulse({x:0,y:5,z:0});
    //     isOnFloor.current = false
    //     //numOfEnemies += 1
    //     //add_new_enemy()
    // };

    //const jumpPressed = useKeyboardControls((state) => state.jump);
    //useFrame((_state,delta) => {
        // if (jumpPressed){
        //     jump();
        // }
        //handleMovement();

        // if (!start) {
        //     return
        // }
        // const curRotation = quat(kicker.current.rotation());
        // const incRotation = new THREE.Quaternion().setFromAxisAngle(
        //     new THREE.Vector3(0,1,0), delta*speed.current
        // );
        // curRotation.multiply(incRotation);
        // kicker.current.setNextKinematicRotation(curRotation);
    
        // speed.current += 0.2*delta

    //})
    //const isOnFloor = useRef(true)

    return (
        <>
        <Ecctrl>
            {/* {<RigidBody position={[-2.5,1,0]} ref={cube}} 
            onCollisionEnter={({other}) => {
                if (other.rigidBodyObject.name === "floor"){
                    isOnFloor.current = true;
                    console.log("landed"+isOnFloor.current)
                }
            }}
            onCollisionExit={({other}) => {
                if (other.rigidBodyObject.name === "floor"){
                    isOnFloor.current = false;
                    console.log("flying"+isOnFloor.current)
                }
            }}
            >*/}
            <Box>
                <meshStandardMaterial color={"royalblue"} />
            </Box>
            {/* {</RigidBody>} */}
        </Ecctrl>
        </>
    )
}