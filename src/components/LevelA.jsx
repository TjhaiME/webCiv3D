import { Box } from '@react-three/drei'
//import { useFrame } from '@react-three/fiber'
import { RigidBody} from '@react-three/rapier';


export const LevelA = () => {
    return (
        <>
        <RigidBody type="fixed" name="floor">
            <Box position={[0,0,0]} args={[20,1,20]}>
                <meshStandardMaterial color="springgreen" />
            </Box>
        </RigidBody>
        </>
    )
}