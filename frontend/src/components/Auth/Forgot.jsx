import React, { useEffect, useState } from 'react'

import { FiAlertCircle, FiEye, FiEyeOff } from "react-icons/fi";
import { FaArrowLeft } from "react-icons/fa";
import axios from 'axios';

const Forgot = ({ showForgotModal, setShowForgotModal }) => {
    const [forgotMsg, setForgotMsg] = useState("");
    const [forgotError, setForgotError] = useState("");
    // const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

useEffect(() => {
  const isModalOpen = localStorage.getItem("showForgotModal") === "true";
  if (isModalOpen) {
    setShowForgotModal(true);
  }
}, []);

useEffect(() => {
  localStorage.setItem("showForgotModal", showForgotModal);
}, [showForgotModal]);

    
    const handleForgotPassword = async (e)=>{
    e.preventDefault();
    try{
      const response = await axios.post("http://127.0.0.1:8000/api/users/forgot-password/",{email:forgotEmail});
      setForgotMsg("Check your email for password reset instructions.");
    } catch (error){
      setForgotError("Failed to send reset link. Try again.");
      console.error("Forgot password error:", error.response?.data);
    }
  };

  return (
    <>
    {showForgotModal &&(
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
              <div className="bg-white w-full max-w-md p-6 rounded shadow-lg relative">
                <button className="absolute top-1 right-2 text-gray-600 hover:text-black text-3xl">&times;</button>
                <div className="flex flex-col items-center">
                  <div className="text-blue-500 text-3xl mb-3"> <FiAlertCircle size={70} className="text-blue-500 mb-3"/> </div>
                  <h2 className="text-xl font-semibold mb-2">Forgot Password</h2>
                  <p className="text-sm text-center mb-4 text-gray-600">
                    Enter your email and we’ll send you a link to reset your password.
                  </p>
                  <input type="email" placeholder="Enter your email" value={forgotEmail} onChange={(e)=> setForgotEmail(e.target.value)} className="w-full p-2 border rounded mb-4" required />

                  {forgotError && <p className="text-sm mb-4 text-red-600">{forgotError}</p>}
                  {forgotMsg && <p className="mb-4 text-green-600 text-sm">{forgotMsg}</p>}
                  <button type="button" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 cursor-pointer" onClick={handleForgotPassword}>Submit</button>

                  <button className="flex items-center text-sm text-gray-600 mt-3 underline font-semibold cursor-pointer" onClick={()=> setShowForgotModal(false)}><FaArrowLeft className="mr-1" /> Back to Login</button>
                </div>
              </div>
            </div>
          )}
</>
          
  )
}

export default Forgot

