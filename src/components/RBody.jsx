import { Box, OrbitControls, Sphere, Torus, useKeyboardControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { RigidBody, quat} from '@react-three/rapier';
import { useRef, useState } from 'react'
//import { Mesh } from 'three' //Typescript
import * as THREE from "three"

import fragmentShader from '../shaders/fragmentShader';
import vertexShader from '../shaders/vertexShader';



var numOfEnemies = 10;//higher to demonstrate how arrays can be used to make multiple JSX elements

export const RBody = () => {
    const [hover, setHover] = useState(false);
    const cube = useRef();
    const kicker = useRef();
    const [start,setStart]= useState(false);
    const jump = () => {
        console.log("trying to jump, isOnFloor.current = "+isOnFloor.current)
        if (!isOnFloor.current){
            console.log("CANT JUMP: not on floor")//for some reason having this console log here caused wakeUp to work better
            return
        }
        cube.current.wakeUp()//sleeping RBs dont respond to impulses
        cube.current.applyImpulse({x:0,y:5,z:0});
        isOnFloor.current = false
        numOfEnemies += 1
    };

    const jumpPressed = useKeyboardControls((state) => state.jump);
    //const jumpPressed = useKeyboardControls((state) => state[Controls.jump]);
    const forwardPressed = useKeyboardControls((state) => state.forward);
    const backPressed = useKeyboardControls((state) => state.back);
    const leftPressed = useKeyboardControls((state) => state.left);
    const rightPressed = useKeyboardControls((state) => state.right);

    const handleMovement = () => {
        if (!isOnFloor.current){
            return;
        }// {console.log("applying planar impulse")}
        let dirPressed = false
        let dir = {x:0,y:0,z:0}
        if (rightPressed) {
            dirPressed = true
            dir = {x:0.1,y:0,z:0}
        }if (leftPressed) {
            dirPressed = true
            dir = {x:-0.1,y:0,z:0}
        }if (forwardPressed) {
            dirPressed = true
            dir = {x:0,y:0,z:0.1}
        }if (backPressed) {
            dirPressed = true
            dir = {x:0,y:0,z:0.1}
        }if (dirPressed) {
            cube.current.applyImpulse(dir);
            console.log("moving in "+JSON.stringify(dir)+" direction")
        }

    }

    const speed = useRef(2.5)

    useFrame((_state,delta) => {
        if (jumpPressed){
            jump();
        }
        handleMovement();

        if (!start) {
            return
        }
        const curRotation = quat(kicker.current.rotation());
        const incRotation = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0,1,0), delta*speed.current
        );
        curRotation.multiply(incRotation);
        kicker.current.setNextKinematicRotation(curRotation);
    
        speed.current += 0.2*delta

    })

    const isOnFloor = useRef(true)
    const arrayOfFloors = [<RigidBody type="fixed" name="floor" ><Box position={[0,0,0]} args={[10,1,10]}><meshStandardMaterial color="springgreen" /></Box></RigidBody>,
    <RigidBody type="fixed" name="floor"><Box position={[1,1,0]} args={[10,1,10]}><meshStandardMaterial color="springgreen" /></Box></RigidBody>
    ]
    
    const arrayOfFloors2 = []
    const arrayOfEnemiesPos = []
    
    console.log("doing update")
    for (var i=0;i<numOfEnemies;i++){
        var posX = 0.2*i
        var posY = 0.3*i
        var posZ = -0.2*i
        var myKey = "key"+i
        arrayOfFloors2.push(<RigidBody type="fixed" name="floor" key={myKey}><Box position={[posX,posY,posZ]} args={[10,1,10]}><meshStandardMaterial color="springgreen" /></Box></RigidBody>)
        arrayOfEnemiesPos.push({x:posX,y:posY,z:posZ})
    }


    return (
        <>
        <ambientLight intensity={0.5} />
        <OrbitControls />

        <RigidBody position={[-2.5,1,0]} ref={cube}
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
        >
            <Box
             onPointerEnter={() => setHover(true)}
             onPointerLeave={() => setHover(false)}
             onClick={() => setStart(true)} 
            >
                <meshStandardMaterial color={hover ? "royalblue" : "hotpink"} />
            </Box>
        </RigidBody>

{/*        <RigidBody type="fixed" name="floor">
            <Box position={[0,0,0]} args={[10,1,10]}>
                <meshStandardMaterial color="springgreen" />
            </Box>
        </RigidBody> */}
        <RigidBody type="fixed" name="floor">
            <Box position={[0,0,0]} args={[10,1,10]}>
                <meshStandardMaterial color="springgreen" />
            </Box>
        </RigidBody>
        {/*arrayOfFloors2/*works but it doesnt like it*/}
        {/*js array of JSX elements works*/}
        {//We can use this to change an array into JSX, 
        arrayOfEnemiesPos.map((enemyDic) => (
            <RigidBody name="enemy" key={"key"+enemyDic.x}>
                <Box position={[enemyDic.x,enemyDic.y,enemyDic.z]} args={[0.5,1,0.5]}>
                    <meshStandardMaterial color="springgreen" />
                </Box>
            </RigidBody>
            )
        )
        }
        

        <RigidBody type="kinematicPosition" position={[0,0.75,0]} ref={kicker}>
            <group position={[2.5,0,0]}>
                <Box args={[5,0.5,0.5]}>
                <meshStandardMaterial color="peachpuff" />
                </Box>
            </group>
        </RigidBody>

        <RigidBody type="fixed">
            <mesh>
                <sphereGeometry/>
                <shaderMaterial
                    fragmentShader={fragmentShader}
                    vertexShader={vertexShader}
                />

            </mesh>
        </RigidBody>

        </>
    )
}












































































