/* state.ts */
import { World } from "miniplex"
import createReactAPI from "miniplex-react"
import { extend } from '@react-three/fiber'

/* Our entity type */
export type Entity = {
    position?: { x: number; y: number; z: number }
    velocity?: { x: number; y: number; z: number }
    health?: {
        current: number
        max: number
    }
    paused?: true
    faction?: number
  }

/* Create a Miniplex world that holds our entities */
const world = new World<Entity>()

/* Create and export React bindings */
export const ECS = createReactAPI(world)