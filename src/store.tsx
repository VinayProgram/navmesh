import React from "react";
import * as THREE from 'three'

interface StoreProviderProps{
  target:THREE.Vector3
  setTarget:React.Dispatch<React.SetStateAction<THREE.Vector3>>
  children: React.ReactNode;
  followCamera: boolean
  setFollowCamera: React.Dispatch<React.SetStateAction<boolean>>
}
const StoreProvider=React.createContext<StoreProviderProps | null>(null)

const StoreProviderComponent=({children}:{children: React.ReactNode})=>{
    const [target, setTarget] = React.useState<THREE.Vector3>(new THREE.Vector3(0, 0, 0))
    const [followCamera, setFollowCamera] = React.useState<boolean>(true)
  return (
  <StoreProvider.Provider value={{target:target, setTarget:setTarget, children:children, followCamera:followCamera, setFollowCamera:setFollowCamera}}>
    {children}
    </StoreProvider.Provider>)
}

export {StoreProvider,StoreProviderComponent}
