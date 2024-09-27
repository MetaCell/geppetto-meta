import { enableMapSet, enablePatches, setUseStrictShallowCopy } from "immer";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

enableMapSet()
enablePatches()
setUseStrictShallowCopy(true)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
