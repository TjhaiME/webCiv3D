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
        











function find_path_on_grid_with_dijkstra_algorithim(initialVertex, finalVertex, vertexGridSize){ //vertexGridSize is sideVertices
//print("find_path_on_grid_with_dijkstra_algorithim from ",initialVertex," to ",finalVertex)
pass
//// Dijkstra’s Algorithm
//// Set each node's position to infinity, I am doing this as I run into them in the while loop
	//for each node in the graph
	var data = {} //declared in while loop
	var dataDefault = {
		"distanceFromStart" : dicData.config.infinity,
		"directionToStart" : null,
	}
//	for vertexKey in vertexData.keys():
//		//set the node's distance to infinity
////		vertexData[vertexKey].dijkstra.distanceFromTown = dicData.config.infinity
////		//already set by default
////		// set the node's parent to none
////		vertexData[vertexKey].dijkstra.directionToTown = null
//		data[vertexKey] = dataDefault.duplicate(true)

	
	//// Create an unexplored set
	//let the unexploredSet equal a set of all the nodes
	var unexploredVertices = [] // vertexData.keys().duplicate(true) //these are strings...
	var exploredVertices = []
//	for initialVert in initialVertices:
//		//var index = sideVertices*initialVert.x + initialVert.y
//		vertexData[str(initialVert.x , ",", initialVert.y)].dijkstra.distanceFromTown = 0
//		vertexData[str(initialVert.x , ",", initialVert.y)].dijkstra.directionToTown = dicData.directionsEnum[Vector2(0,0)]
//
//		unexploredVertices.append([0, initialVert])
	data[str(initialVertex.x , ",", initialVertex.y)] = dataDefault.duplicate(true)
	data[str(initialVertex.x , ",", initialVertex.y)]["distanceFromStart"] = 0
	data[str(initialVertex.x , ",", initialVertex.y)]["directionToStart"] = dicData.directionsEnum[Vector2(0,0)]
	unexploredVertices.append([0, initialVertex])
	
	var endCondition = false
	//print("about to start while loop")
	while(!endCondition)://while the unexploredSet is not empty //this only works for fully connected maps
		//print("in while loop")
		//// Get the current node
		//do I have to sort the vertices for every loop?
		unexploredVertices.sort_custom(Callable(MyCustomSorter, "sort_descending")) //seems very inefficient, we choose sort_descending so we can pop_back
		var current_decision_and_vertex = unexploredVertices.pop_back()//    let the currentNode equal the node with the smallest distance
		var currentVertex = current_decision_and_vertex[1]
		//print("currentVertex = ", currentVertex)
		exploredVertices.append(currentVertex)
		data[str(currentVertex.x , ",", currentVertex.y)]["distanceFromStart"] = current_decision_and_vertex[0]  //record the distance for later
		
		
		for dir in dicData.commonArrays["adjacentEdgeMod"]:// for each neighbor (still in unexploredSet) to the currentNode
			var neighbour = currentVertex + dir
			//if not inBounds(neighbour):
			if not worldData.custom_inBounds(neighbour, vertexGridSize):
				continue
			//        // Calculate the new distance
			var newDistance = current_decision_and_vertex[0] + travelDifficulty(currentVertex, neighbour)
			if exploredVertices.has(neighbour):
				continue
			if !data.has(str(neighbour.x , ",", neighbour.y)):
				data[str(neighbour.x , ",", neighbour.y)] = dataDefault.duplicate(true)
			var oldDistance = data[str(neighbour.x , ",", neighbour.y)]["distanceFromStart"]
			if oldDistance == dicData.config.infinity:
				unexploredVertices.append([oldDistance, neighbour])
			if newDistance < oldDistance:
				data[str(neighbour.x , ",", neighbour.y)]["distanceFromStart"] = newDistance
				data[str(neighbour.x , ",", neighbour.y)]["directionToStart"] = dicData.directionsEnum[-dir] //set neighbor's parent to currentNode
				var neighbourIndex = unexploredVertices.rfind([oldDistance, neighbour])
				unexploredVertices[neighbourIndex][0] = newDistance
		
		//check if we should end
		if currentVertex.x == finalVertex.x and currentVertex.y == finalVertex.y:
			endCondition = true //reached the end
			//print("reached end")
		if unexploredVertices.size() <= 0:
			endCondition = true
			//print("ran out of vertices to explore")
	//print("while loop ends")
	
	//while loop ends
	//now actually get path
	//now the while loop is finished we need to reconstruct a path from the startNode to endNode
	var tempPath = []
	var endTrace = false
	var currentVertex = finalVertex
	tempPath.append(currentVertex)
	while endTrace == false:
		var prevVertex = currentVertex + dicData.directionsDic[ data[str(currentVertex.x,",",currentVertex.y)]["directionToStart"] ]//previousNodes[currentNode]
		//print("previousVertex = ", prevVertex)
//		if prevVertex == null:
//			endTrace = true
//			//print("tempPathFind has failed")
//			tempPath = []
		if prevVertex == initialVertex:
			//print("tempPathFind is a success")
			endTrace = true
//			tempPath.append(prevVertex)
//			currentNode = prevVertex
//		else: //valid middle tempPath element
//			tempPath.append(prevVertex)
//			currentNode = prevVertex
		tempPath.append(prevVertex)
		currentVertex = prevVertex
	
	//path is from end to start, we need to reverse it so it goes from start to end
	//print("tempPath = ", tempPath)
	//var tempPath = path.duplicate()
	var vertexPath = worldData.array_invert(tempPath) //invert was returning null for some reason
	var stringPath = []
	for vert in vertexPath:
		stringPath.append(str(vert.x,",",vert.y))
	//path = path.reverse() //THIS IS ILLEGAL
	//print("stringPath = ", stringPath)
	return stringPath
}