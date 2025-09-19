import React from 'react'
import Footer from '../Footer/Footer'

const Home = () => {
  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white font-sans flex flex-col justify-between">
      <div className="flex flex-col md:flex-row items-center justify-between py-12 flex-grow gap-10 px-6 lg:px-20">
        
        <div className='flex justify-center md:justify-end w-full md:w-auto'>
          <img
            src="/love.png"
            alt="Heart with hands"
            className="w-60 sm:w-70 md:w-75 max-w-full h-auto"
          />
        </div>

        <div className="w-full md:w-2/3 text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-snug">
            Save <span className="text-red-500">Life</span> Donate{' '}
            <span className="text-red-600">Blood</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-300 mb-8 leading-relaxed lg:pr-15">
            Donate blood and be a hero. Your small act of kindness can save lives. Every drop of blood you give can help someone in need whether it's accident victims, patients in surgery, or those fighting serious illnesses. By donating blood, you become part of a proud tradition that has been saving lives for centuries. It’s a simple, safe, and powerful way to make a real difference in your community. Be someone’s hope. Make an impact today with this lifesaving act.
          </p>
          <a href="/blood-request">
          <button className="bg-transparent border border-red-700 text-white px-6 py-2 rounded hover:bg-red-700 transition-all duration-300 font-medium cursor-pointer">
            Request Now
          </button>
          </a>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Home
