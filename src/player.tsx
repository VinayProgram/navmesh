import { useFrame, useThree } from '@react-three/fiber'
import React, { useRef } from 'react'
import * as THREE from 'three'
import * as YUKA from 'yuka'
import { createGraphHelper } from './graph.helper'
import { StoreProvider } from './store'
import { useKeyboardControls } from '@react-three/drei'

const FP = () => {
    const fpRef = useRef<THREE.Mesh>(null)
    const context = React.useContext(StoreProvider)
    const { target: targetPath, followCamera } = context!
    const navmesh = useNavmeshHelper()
    const EntityManager = new YUKA.EntityManager()
    const fp = new YUKA.Vehicle()
    const [, get] = useKeyboardControls();
    fp.setRenderComponent(fpRef.current!, (entity, renderComponent) => {
        //@ts-ignore
        renderComponent.matrix.copy(entity.worldMatrix)
    })


    EntityManager.add(fp)
    useFrame((state, delta) => {
        fpRef.current?.position.set(fp.position.x, fp.position.y, fp.position.z)
        if (followCamera) {
            const fpPosition = fpRef.current?.position.clone()
            if (fpPosition) {
                const cameraPos = fpPosition.clone().add(
                    new THREE.Vector3(0, 1.3, 0).applyEuler(fpRef.current!.rotation)
                )
                const forward = new THREE.Vector3(0, 0, -1)
                    .applyEuler(fpRef.current!.rotation)    
                const target = cameraPos.clone().add(forward)
                state.camera.position.lerp(cameraPos, 0.1)
                state.camera.lookAt(target)
            }
        }
        const direction = new THREE.Vector3()
        state.camera.getWorldDirection(direction)
        direction.normalize()
        const { forward, backward, left, right, space } = get();
        const speed = 0.4
        if (forward) {
            fp.velocity.copy(new YUKA.Vector3(direction.x, direction.y, direction.z).multiplyScalar(speed))
        } else if (backward) {
            fp.velocity.copy(new YUKA.Vector3(direction.x, direction.y, direction.z).multiplyScalar(-speed))
        }
        if (space) fp.velocity.set(0, 0, 0)
        if (left) fpRef.current?.rotateY(0.05);
        if (right) fpRef.current?.rotateY(-0.05);
        EntityManager.update(delta) 
    })

    React.useEffect(() => {
        gotoTargetPath()
    }, [targetPath])

    const gotoTargetPath = () => {
        if (!fpRef.current) return
        fp.position.copy(new YUKA.Vector3(fpRef.current.position.x, fpRef.current.position.y, fpRef.current.position.z))
        const targetPosition = targetPath
        const c = navmesh?.findPath(
            new YUKA.Vector3(fp.position.x, fp.position.y, fp.position.z),
            new YUKA.Vector3(targetPosition.x, targetPosition.y, targetPosition.z)
        )
        if (!c) return
        const path = new YUKA.Path()
        for (let i = 0; i < c.length; i++) {
            path.add(new YUKA.Vector3(c[i].x, c[i].y, c[i].z))
        }
        fp.steering.add(new YUKA.FollowPathBehavior(path, 0.5))
    }

    return (
        <group>
            <mesh visible={false} ref={fpRef} name="fp" onClick={(e) => { console.log(e) }}>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial color="red" />
            </mesh>
            {/* <PointerLockControls /> */}

        </group>
    )
}

export default FP


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

