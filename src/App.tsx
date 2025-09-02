import { OrbitControls, } from '@react-three/drei'
import { Canvas, useFrame, useLoader, useThree, type ThreeEvent } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import React, { useRef, useState } from 'react'
import * as THREE from 'three'
import * as YUKA from 'yuka'
import { createGraphHelper } from './graph.helper'
const App = () => {
  const [targetPath, setTargetPath] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 0))
  const [followCamera, setFollowCamera] = useState<boolean>(false)
  return (
    <>
      <button id='CameraView' style={{ position: "absolute", top: "10px", left: "10px", zIndex: 100 }} onClick={() => setFollowCamera(!followCamera)}>Camera {followCamera ? "Following" : "Orbit"}</button>
      <Canvas style={{ width: "100vw", height: "100vh" }}>
        <OrbitControls />
        <ambientLight intensity={1} />
        <ModelLoader url="/navmesh.glb" onClick={(e) => { setTargetPath(e.point) }} />
        <ModelLoader url="/base_model.glb" />
        <FP targetPath={targetPath} followCamera={followCamera} />
      </Canvas>
    </>
  )
}

const ModelLoader = (props: { url: string, onClick?: (e: ThreeEvent<MouseEvent>) => void }) => {
  const { scene } = useLoader(GLTFLoader, props.url)

  return (
    <mesh {...props} >
      <primitive object={scene} />
    </mesh>
  )
}

const FP = ({ targetPath, followCamera }: { targetPath: THREE.Vector3, followCamera: boolean }) => {
  const fpRef = useRef<THREE.Mesh>(null)
  const navmesh = useNavmeshHelper()
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)
  const EntityManager = new YUKA.EntityManager()
  const fp = new YUKA.Vehicle()
  const { set } = useThree()

  fp.setRenderComponent(fpRef.current!, (entity, renderComponent) => {
    renderComponent.matrix.copy(entity.worldMatrix)
  })

  EntityManager.add(fp)
  useFrame((state, delta) => {
    if (cameraRef.current) {
      if (followCamera) {
        // Follow the fpRef position (already updated by YUKA)
        const fpPosition = fpRef.current?.position.clone()
        if (fpPosition) {
          cameraRef.current.position.lerp(
            fpPosition.clone().add(new THREE.Vector3(0, 1, 1)),
            0.1
          )
          cameraRef.current.lookAt(fpPosition.clone().add(new THREE.Vector3(0, 1, 0)))
          set({ camera: cameraRef.current })
        }
      }
    }

    EntityManager.update(delta) // update YUKA every frame
  })

  React.useEffect(() => gotoTargetPath(), [targetPath])
  const gotoTargetPath = () => {
    const currentPosition = fpRef.current?.position
    if (!currentPosition) {
      return
    }
    const targetPosition = targetPath
    const c = navmesh?.findPath(new YUKA.Vector3(currentPosition?.x, currentPosition?.y, currentPosition?.z), new YUKA.Vector3(targetPosition.x, targetPosition.y, targetPosition.z))
    const path = new YUKA.Path()
    if (c) {
      for (let i = 0; i < c.length; i++) {
        path.add(new YUKA.Vector3(c[i].x, c[i].y, c[i].z))
      }
    }
    const followPathBehavior = fp.steering.add(new YUKA.FollowPathBehavior(path, 0.5))

  }
  return (
    <>
      <mesh ref={fpRef} name="fp" position={[0, 0.2, 0]} matrixAutoUpdate={false}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="red" />
      </mesh>
      {/* <mesh ref={cameraProto} name="fp" position={[0, 0.2, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="black" />
      </mesh> */}
      <perspectiveCamera ref={cameraRef} fov={75} near={0.1} far={1000} />
    </>
  )
}

const useNavmeshHelper = () => {
  const NavmeshLoader = new YUKA.NavMeshLoader()
  const { scene } = useThree()
  const [navigationMesh, setNavigationMesh] = React.useState<YUKA.NavMesh>()
  React.useEffect(() => {
    NavmeshLoader.load('../public/navmesh.glb').then(navigationMesh => {
      const graphHelper = createGraphHelper(navigationMesh.graph, 0.02)
      scene.add(graphHelper)
      setNavigationMesh(navigationMesh)
    })
  }, [])
  return navigationMesh
}


export default App
