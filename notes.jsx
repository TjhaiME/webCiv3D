return (
    <Canvas>
      <Suspense>{/*make sure everything is loaded before doing calculations*/}
        <Physics debug>{/*things in here are affected by physics*/}
          <rBody />
        </Physics>
      </Suspense>
    </Canvas>
  )




  onCollisionEnter={({other}) => {
    if (other.rigidBodyObject.name === "floor"){
        isOnFloor.current = true;
        //console.log("we hit the floor isOnFloor=" isOnFloor.current)
        //if we collide with something with the name "floor" then record that we are on the floor
    }
 }}
 onCollisionExit={({other}) => {
    if (other.rigidBodyObject.name === "floor"){
        isOnFloor.current = false;
        //console.log("we left the floor isOnFloor=", isOnFloor.current)
    }
 }}









//we return this to return multiple enemies
<>
{
 arrayOfEnemiesPos.map((enemyDic) => (
  <RigidBody name="enemy" key={enemyDic.key}>
      <Box position={[enemyDic.pos.x,enemyDic.pos.y,enemyDic.pos.z]} args={[0.5,1,0.5]}>
          <meshStandardMaterial color={enemyDic.col} />
      </Box>
  </RigidBody>
  )
)
}
</>






         {//enemyKeys.map((eKey) => (
        //     <RigidBody name="enemy" key={enemyDic[eKey].key}>
        //         <Box position={[enemyDic[eKey].pos.x,enemyDic[eKey].pos.y,enemyDic[eKey].pos.z]} args={[0.5,1,0.5]}>
        //             <meshStandardMaterial color={enemyDic[eKey].col} />
        //         </Box>
        //     </RigidBody>
        //     )
        // )
      }
        
