import React, { useState } from 'react'
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className='flex'>
        <Sidebar />

        <div className="flex-1 min-h-screen bg-gray-100 dark:bg-gray-900">
            <nav className='flex items-center justify-between p-4 shadow bg-white dark:bg-gray-800'>
                
                <span className="text-xl font-bold text-gray-800 dark:text-white">Project R.E.D</span>
            </nav>

            <div className="p-6">Your content here</div>
        </div>
    </div>
  )
}

export default Layout
