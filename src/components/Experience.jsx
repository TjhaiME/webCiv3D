import { OrbitControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
//import { Mesh } from 'three' //Typescript

export const Experience = () => {
    const meshRef = useRef(null);

    useFrame(() => { // we use this to update the component from within the component
        if (!meshRef.current) {
            return;
        }
        meshRef.current.rotation.x += 0.02
        meshRef.current.rotation.y += 0.01
    });


    return (
        <>
        <OrbitControls />
            <mesh ref={meshRef}>
                <boxGeometry />
                <meshNormalMaterial />
            </mesh>
        </>
    )
}