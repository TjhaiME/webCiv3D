import { Sphere } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier';


import fragmentShader from '../shaders/fragmentShader.js';
import vertexShader from '../shaders/vertexShader.js';


export const SkySphere = () => {
   

    return (
    <RigidBody position={[0,5,0]}>
        <mesh>
            <Sphere/>
            <shaderMaterial
                fragmentShader={fragmentShader}
                vertexShader={vertexShader}
            />

        </mesh>
    </RigidBody>
    )
}

