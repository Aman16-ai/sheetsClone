import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { createBrowserRouter,RouterProvider } from 'react-router-dom'
import GoogleSheetsClone from './components/GoogleSheetsClone'
import Sheets from './components/Sheets'


function Home() {

  return (
    <h1 className='text-red-600'>This is the home</h1>
  )

}
function About() {

  return (
    <h1>This is the About</h1>
  )

}

const router = createBrowserRouter([


  {
    index: true,
    element : <Sheets/>
  },
  {
    path: "/about",
    element : <GoogleSheetsClone/>

  }

])
function App() {
  

  return (
    <>
      <RouterProvider router={router}/>
    </>
  )
}

export default App
