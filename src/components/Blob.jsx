import { useMemo, useRef} from 'react'
//import './App.css'
import { useFrame } from '@react-three/fiber';
import { MathUtils } from "three";

import fragmentShader from '../shaders/tut3FragShad.js';//3=blob
import vertexShader from '../shaders/tut3VertShad.js';

export const Blob = () => {
    // This reference will give us direct access to the mesh
    const mesh = useRef();
    const hover = useRef(false);
    
    const uniforms = useMemo(
        () => ({
        u_intensity: {
            value: 0.3,
        },
        u_time: {
            value: 0.0,
        },
        }),
        []
    );
    
    useFrame((state) => {
        const { clock } = state;
        mesh.current.material.uniforms.u_time.value = 0.4 * clock.getElapsedTime();
    
        mesh.current.material.uniforms.u_intensity.value = MathUtils.lerp(
        mesh.current.material.uniforms.u_intensity.value,
        hover.current ? 0.85 : 0.15,
        0.02
        );
    });
    
    return (
        <mesh
        ref={mesh}
        position={[0, 0, 0]}
        scale={1.5}
        onPointerOver={() => (hover.current = true)}
        onPointerOut={() => (hover.current = false)}
        >
        <sphereGeometry args={[2, 20]} />
        <shaderMaterial
            fragmentShader={fragmentShader}
            vertexShader={vertexShader}
            uniforms={uniforms}
            wireframe={false}
        />
        </mesh>
    );
    
}