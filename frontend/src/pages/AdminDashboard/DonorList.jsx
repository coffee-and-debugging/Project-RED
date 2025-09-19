import React from 'react'
import AdminSidebar from './AdminSidebar'

const DonorList = () => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
        <AdminSidebar />
        <div className="flex-1 h-screen overflow-y-auto p-4 md:p-8 mt-4 lg:mt-0">
            <h1 className="text-2xl font-bold mb-6">All Donors</h1>
            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow overflow-x-auto">
                <table className="w-full min-w-[600px] text-left border-collapse">
                    <thead>
                        <tr className='border-b border-gray-300'>
                            <th className="font-semibold p-2">Name</th>
                            <th className="font-semibold p-2">Blood Group</th>
                            <th className="font-semibold p-2">Location</th>
                            <th className="font-semibold p-2">Last Donated</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr className="hover:bg-gray-100 dark:hover:bg-gray-700 transition border-b border-gray-200">
                            <td className="p-2">Pramod Sharma</td>
                            <td className="p-2">A+</td>
                            <td className="p-2">Bharatpur</td>
                            <td className="p-2">2025-06-30</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
      
    </div>
  )
}

export default DonorList
