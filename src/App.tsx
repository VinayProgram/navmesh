import { Html, KeyboardControls, OrbitControls, useProgress } from '@react-three/drei'
import { Canvas, useLoader, type ThreeEvent } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import React, { Suspense } from 'react'
import FP from './player'
import { StoreProvider } from './store'

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
          {/* Navmesh loader - hidden mesh */}
          <ModelLoader url="/navmesh.glb" hidden onClick={(e) => setTarget(e.point)} />
          </Suspense>
          {/* Base model loader - visible */}
          <Suspense fallback={<Loader label="Scene" />}>
          <ModelLoader url="/base_model.glb" />
          </Suspense>

          <Suspense fallback={<Loader label="Player" />}>
          <FP />
          </Suspense>
        </Canvas>
      </KeyboardControls>
    </>
  )
}

const ModelLoader = (props: { url: string, hidden?: boolean, onClick?: (e: ThreeEvent<MouseEvent>) => void }) => {
  const { scene } = useLoader(GLTFLoader, props.url)

  // Clone scene to avoid modifying the original
  const cloned = React.useMemo(() => scene.clone(), [scene])

  // Hide if needed
  if (props.hidden) cloned.traverse(obj => { obj.visible = false })

  return (
    <mesh {...props}>
      <primitive object={cloned} />
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