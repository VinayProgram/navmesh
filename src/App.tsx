import { Html, KeyboardControls, OrbitControls, useProgress } from '@react-three/drei'
import { Canvas, useLoader, type ThreeEvent } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import React, { Suspense } from 'react'
import FP from './player'
import { StoreProvider } from './store'
import * as THREE from 'three'
const App = () => {
  const context = React.useContext(StoreProvider)
  const { setTarget, followCamera, setFollowCamera } = context!

  return (
    <>
      <button
        id='CameraView'
        style={{ position: "absolute", top: "10px", left: "10px", zIndex: 100 }}
        onClick={() => setFollowCamera(!followCamera)}
      >
        Camera {followCamera ? "Following" : "Orbit"}
      </button>

      <KeyboardControls map={[
        { name: "forward", keys: ["w", "ArrowUp"] },
        { name: "backward", keys: ["s", "ArrowDown"] },
        { name: "left", keys: ["a", "ArrowLeft"] },
        { name: "right", keys: ["d", "ArrowRight"] },
        { name: "space", keys: ["space", " "] },
      ]}>
        <Canvas style={{ width: "100vw", height: "100vh" }}>
          <OrbitControls />
          <ambientLight intensity={1} />

          <Suspense fallback={<Loader label="Map" />}>
          <ModelLoader url="/navmesh.glb" hidden  position={new THREE.Vector3(-1.3, 0, 0)}  onClick={(e) => {
            console.log(e.point)
            setTarget(e.point)}} />
          </Suspense>
          {/* Base model loader - visible */}
          <Suspense fallback={<Loader label="Scene" />}>
          <ModelLoader url="/base_model.glb" position={new THREE.Vector3(-1.3, 0, 0)} />
          </Suspense>

          <Suspense fallback={<Loader label="Player" />}>
          <FP />
          </Suspense>
        </Canvas>
      </KeyboardControls>
    </>
  )
}

const ModelLoader = (props: { url: string, position?: THREE.Vector3, hidden?: boolean, onClick?: (e: ThreeEvent<MouseEvent>) => void }) => {
  const { scene } = useLoader(GLTFLoader, props.url) 
  return (
    <mesh {...props} visible={!props.hidden}>
      <primitive object={scene} />
    </mesh>
  )
}

export default App


const Loader = ({label}:{label:string}) => {
  const { progress } = useProgress()
  return (
    <Html center>
      <div style={{ 
        background: "rgba(0,0,0,0.7)", 
        color: "white", 
        padding: "10px 20px", 
        borderRadius: "8px" 
      }}>
        Loading {label}... {progress.toFixed(0)}%
      </div>
    </Html>
  )
}