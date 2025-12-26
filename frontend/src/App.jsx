import React from 'react'
import AppRoutes from './routes'
import { ToastContainer } from 'react-toastify'

const App = () => {
  return (
    <>
    <AppRoutes />
    <ToastContainer theme="light" />
    </>
  )
}

export default App
