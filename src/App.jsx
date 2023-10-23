import { Suspense, useMemo, useState , useRef} from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import './App.css'
import { Physics } from '@react-three/rapier';
//import { useFrame } from '@react-three/fiber';
//import { Suspense } from '@react-three/rapier';

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
import { OrbitControls } from '@react-three/drei';
import { InstancedBoxes } from './components/Instancing';

import { Player } from './components/Player';
import { SkySphere } from './components/skySphere';
import { Color,MathUtils } from "three";
//import { MathUtils } from "three";



export const Controls = {
  forward: "forward",
  back: "back",
  left: "left",
  right: "right",
  jump: "jump",
}

export const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
  { name: "rightward", keys: ["ArrowRight", "KeyD"] },
  { name: "jump", keys: ["Space", "KeyE"] },
  { name: "run", keys: ["Shift"] },
  // Optional animation key map
  { name: "action1", keys: ["1"] },
  { name: "action2", keys: ["2"] },
  { name: "action3", keys: ["3"] },
  { name: "action4", keys: ["KeyF"] },
];
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





function App() {
  // const map = useMemo(() => [
  //   { name: Controls.forward, keys:["ArrowUp", "KeyW"] },
  //   { name: Controls.back, keys:["ArrowDown", "KeyS"] },
  //   { name: Controls.left, keys:["ArrowLeft", "KeyA"] },
  //   { name: Controls.right, keys:["ArrowRight", "KeyD"] },
  //   { name: Controls.jump, keys:["Space"] },
  // ],[]);
  const map = useMemo(() => keyboardMap,[]);

  // return (
  //   <KeyboardControls map={map}>
  //     <Canvas shadows camera={{position:[-10,10,0]}} intensity={0.4}>
  //       <jsonWorld />
  //     </Canvas>
  //   </KeyboardControls>
  // )


  // return (
  //   <KeyboardControls map={map}>
  //     <Canvas shadows camera={{position:[-10,10,0]}} intensity={0.4}>
  //       <Suspense>
  //         <Physics debug>
  //           <RBody />
  //         </Physics>
  //       </Suspense>
  //     </Canvas>
  //   </KeyboardControls>
  // )

//<OrbitControls />
  // return (
  //   <>
  //   <KeyboardControls map={map}>
  //     <Canvas shadows camera={{position:[-10,10,0]}} intensity={0.4}>
  //       <Suspense>
  //         <Physics debug>
  //           <ambientLight intensity={0.5} />
  //           <SkySphere/>
  //           <Player />
  //           <Enemies />
  //           <LevelA />
  //         </Physics>
  //       </Suspense>
  //     </Canvas>
  //   </KeyboardControls>
  //   </>
  // )
  const BaseShaderTest = () => {
    //const mesh = useRef();
    return (
      <mesh position={[0,2,0]}>
      <sphereGeometry args={[1]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
      />
    </mesh>
    );
  };
  const MovingPlane = () => {
    // This reference will give us direct access to the mesh
    const mesh = useRef();
  
    const uniforms = useMemo(
      () => ({
        u_time: {
          value: 0.0,
        },
        u_colorA: { value: new Color("#FFE486") },
        u_colorB: { value: new Color("#FEB3D9") },
      }), []
    );
  
    useFrame((state) => {
      const { clock } = state;
      mesh.current.material.uniforms.u_time.value = clock.getElapsedTime();
    });
  
    return (
      <mesh ref={mesh} position={[0, 2, 0]} rotation={[-Math.PI / 2, 0.5, 1]} scale={1.5}>
        <planeGeometry args={[1, 1, 16, 16]} />
        <shaderMaterial
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          uniforms={uniforms}
          wireframe={false}
        />
      </mesh>
    );
  };


  // const Blob = () => {
  //   // This reference will give us direct access to the mesh
  //   const mesh = useRef();
  //   const hover = useRef(false);
  
  //   const uniforms = useMemo(
  //     () => ({
  //       u_intensity: {
  //         value: 0.3,
  //       },
  //       u_time: {
  //         value: 0.0,
  //       },
  //     }),
  //     []
  //   );
  
  //   useFrame((state) => {
  //     const { clock } = state;
  //     mesh.current.material.uniforms.u_time.value = 0.4 * clock.getElapsedTime();
  
  //     mesh.current.material.uniforms.u_intensity.value = MathUtils.lerp(
  //       mesh.current.material.uniforms.u_intensity.value,
  //       hover.current ? 0.85 : 0.15,
  //       0.02
  //     );
  //   });
  
  //   return (
  //     <mesh
  //       ref={mesh}
  //       position={[0, 0, 0]}
  //       scale={1.5}
  //       onPointerOver={() => (hover.current = true)}
  //       onPointerOut={() => (hover.current = false)}
  //     >
  //       <icosahedronGeometry args={[2, 20]} />
  //       <shaderMaterial
  //         fragmentShader={fragmentShader}
  //         vertexShader={vertexShader}
  //         uniforms={uniforms}
  //         wireframe={false}
  //       />
  //     </mesh>
  //   );
  // };


  return (
    <>
      <Canvas shadows camera={{position:[-10,10,0]}} intensity={0.4}>
        <Suspense>
          <Physics debug>
            <ambientLight intensity={0.5} />
            {/*<SkySphere/>*/}
            <KeyboardControls map={map}>
              <Player />
            </KeyboardControls>
            <Enemies />
            <LevelA />
            <StarSphere/>
            <InstancedBoxes/>
          </Physics>
        </Suspense>
      </Canvas>
    </>
  )

}

export default App
