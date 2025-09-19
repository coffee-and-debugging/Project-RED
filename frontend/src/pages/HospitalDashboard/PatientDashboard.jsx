import React from 'react'
import BloodRequest from '../../components/blood/BloodRequest'

const PatientDashboard = () => {
  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold text-blue-600">Patient Dashboard</h1>
      <p className="mt-2">Request blood and track responses from donors.</p>
      <BloodRequest />
    </div>
  )
}

export default PatientDashboard
