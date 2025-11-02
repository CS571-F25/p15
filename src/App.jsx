import { useState } from 'react'
import './App.css'
import { HashRouter, Route, Routes } from 'react-router'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
      </Routes>
    </HashRouter>
  )
}

export default App
