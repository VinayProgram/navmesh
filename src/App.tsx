import { OrbitControls,  } from '@react-three/drei'
import { Canvas, useFrame, useLoader, useThree, type ThreeEvent } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import React, { useRef, useState } from 'react'
import * as THREE from 'three'
import * as YUKA from 'yuka'
import { createGraphHelper } from './graph.helper'
const App = () => {
  const [targetPath, setTargetPath] = useState<THREE.Vector3>(new THREE.Vector3(0,0,0))

  return (
    <Canvas style={{width:"100vw",height:"100vh"}}>
      <OrbitControls/>
      <ambientLight intensity={1} />
      <ModelLoader url="/navmesh.glb" onClick={(e)=>{setTargetPath(e.point)}} />
      <ModelLoader url="/base_model.glb" />
      <NavmeshHelper/>
      <FP targetPath={targetPath} />
    </Canvas>
  )
}

const ModelLoader=(props:{url:string,onClick?:(e:ThreeEvent<MouseEvent>)=>void})=>{
  const {scene} = useLoader(GLTFLoader, props.url)
  
  return (
    <mesh {...props} >
      <primitive object={scene}/>
    </mesh>
  )
}

const FP = ({targetPath}: {targetPath: THREE.Vector3}) => {
  const fpRef = useRef<THREE.Mesh>(null)

  const cameraRef = useRef<THREE.PerspectiveCamera>(null)
  const { set } = useThree()

  useFrame(() => {
    if (fpRef.current && cameraRef.current) {
      const fpPosition = fpRef.current.position.clone()
      cameraRef.current.position.copy(fpPosition.clone().add(new THREE.Vector3(0, 1, 1)))
      cameraRef.current.lookAt(fpPosition.clone().add(new THREE.Vector3(0, 1, 1)))
      // set({ camera: cameraRef.current })
      gotoTargetPath()
    }
  })

  const gotoTargetPath=()=>{
    const currentPosition = fpRef.current?.position
    const targetPosition = targetPath
    fpRef.current?.position.lerp(targetPosition, 0.1)
  }
  return (
    <>
    <axesHelper >
      <mesh ref={fpRef} name="fp" position={[0, 0.2, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="red" />
      </mesh>
    </axesHelper>
      {/* <mesh ref={cameraProto} name="fp" position={[0, 0.2, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="black" />
      </mesh> */}
      <perspectiveCamera ref={cameraRef} fov={75} near={0.1} far={1000} />
    </>
  )
}

const NavmeshHelper=()=>{
  const NavmeshLoader=new YUKA.NavMeshLoader()
  const {scene} = useThree()
  React.useEffect(()=>{
    NavmeshLoader.load('../public/navmesh.glb').then(d=>{
      const graphHelper=createGraphHelper(d.graph,0.02)
      scene.add(graphHelper)
    })
  },[])
  return <>
  
  </>
}


export default App
