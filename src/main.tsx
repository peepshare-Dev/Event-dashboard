import React from 'react'
import ReactDOM from 'react-dom/client'
import { addCollection } from '@iconify/react'
import App from './App'
import solarIcons from './assets/solar-icons-subset.json'
import './index.css'

addCollection(solarIcons)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
