//I suck at react,m just follow a sandbox:
//https://codesandbox.io/s/react-three-fiber-boilerplate-cannon-change-instance-property-mt917w?from-embed=&file=/src/App.jsx
//import { Stats, OrbitControls } from '@react-three/drei'
//import { Canvas } from '@react-three/fiber'
import { useRef } from 'react'
//import { Debug, Physics, useBox, usePlane } from '@react-three/cannon'
//import { useControls } from 'leva'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

// function Plane(props) {
//   usePlane(() => ({ ...props }))
// }
var needsUpdate = false
export const InstancedBoxes = () => {
  // const [ref, { at }] = useBox(
  //   (i) => ({
  //     args: [1, 1, 1],
  //     type: 'Dynamic',
  //     position: [
  //       Math.floor(i % 8) * 1.01 - 4,
  //       Math.floor((i / 64) % 64) * 1.01 + 4,
  //       Math.floor((i / 8) % 8) * 1.01 - 4
  //     ]
  //   }),
  //   useRef()
  // )
  const ref = useRef()
  const tempObject = new THREE.Object3D()
  
  useFrame((state) => {
  //if (ref){
    if(needsUpdate === false){
      return
    }
    //const time = state.clock.getElapsedTime()
    let i = 0
    for (let x = 0; x < 10; x++){
      for (let y = 0; y < 10; y++){
        for (let z = 0; z < 10; z++) {
          const id = i++
          tempObject.position.set(5 - x, 5 - y, 5 - z)
          tempObject.rotation.y = Math.sin(x / 4 + i) + Math.sin(y / 4 + i) + Math.sin(z / 4 + i)
          tempObject.rotation.z = tempObject.rotation.y * 2
          
          tempObject.updateMatrix()
          ref.current.setMatrixAt(id, tempObject.matrix)
        }
      }
    }
    ref.current.instanceMatrix.needsUpdate = true
    needsUpdate = false//turn off updates
  })
  needsUpdate = true
  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, 1000]}
      onPointerDown={(e) => {
        e.stopPropagation()
        at(e.instanceId).mass.set(1)
      }}>
      <boxGeometry args={[1, 1, 1]} />
      <meshNormalMaterial />
    </instancedMesh>
  )
}

// export const InstanceTest = () => {//app
//   const gravity = useControls('Gravity', {
//     x: { value: 0, min: -10, max: 10, step: 0.1 },
//     y: { value: -9.8, min: -10, max: 10, step: 0.1 },
//     z: { value: 0, min: -10, max: 10, step: 0.1 }
//   })

//   return (
//     <Canvas camera={{ position: [6, 9, 9] }}>
//       <Physics gravity={[gravity.x, gravity.y, gravity.z]} broadphase="SAP">
//         <Debug color={0x004400}>
//           <Plane rotation={[-Math.PI / 2, 0, 0]} />
//         </Debug>
//         <InstancedBoxes />
//       </Physics>
//       <OrbitControls target-y={5} />
//       <Stats />
//     </Canvas>
//   )
// }

