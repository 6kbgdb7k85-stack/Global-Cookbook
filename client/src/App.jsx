import { useState } from 'react'
import { Outlet } from 'react-router'


function App() {

  return (
    <>
      App Component
      <Outlet context={{}}/>
    </>
  )
}

export default App
