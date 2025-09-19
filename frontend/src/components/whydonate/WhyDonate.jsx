import React from 'react'
import Footer from '../Footer/Footer'

const WhyDonate = () => {
  return (
    <div className='bg-[#1e1e1e] text-white min-h-screen font-sans flex flex-col'>
      <main className='flex flex-col md:flex-row max-w-7xl mx-auto flex-grow gap-10 px-6 md:px-16 py-12'>
        <section className="md:w-2/3">
        <h2 className='font-bold text-3xl md:text-4xl mb-6 tracking-wider leading-snug'>Why Should I Donate Blood ?</h2>
        <hr className="mb-6 border-gray-600"></hr>
      
        <p className='mb-6 text-lg text-gray-300 leading-relaxed'>
          Blood is the most precious gift that anyone can give to another person the gift of life. A decision to donate your blood can save a life, or even several if your blood is separated into its components red cells, platelets and plasma which can be used individually for patients with specific conditions. Safe blood saves lives and improves health. Blood transfusion is needed for:
        </p>
        <ul className='list-disc pl-6 text-base text-gray-200 mb-6 space-y-2'>
          <li>Women with complications of pregnancy, such as ectopic pregnancies and haemorrhage before, during or after childbirth.</li>
          <li>Children with severe anaemia often resulting from malaria or malnutrition.</li>
          <li>People with severe trauma following man-made and natural disasters.</li>
          <li>Many complex medical and surgical procedures and cancer patients.</li>
        </ul>
        <p className='text-lg text-gray-300 leading-relaxed'>
          It is also needed for regular transfusions for people with conditions such as thalassaemia
            and sickle cell disease and is used to make products such as clotting factors for people with
            haemophilia. There is a constant need for regular blood supply because blood can be stored for
            only a limited time before use. Regular blood donations by a sufficient number of healthy people
            are needed to ensure that safe blood will be available whenever and wherever it is needed.
        </p>
        </section>

        {/* Right Section: Image */}
        <section className="md:w-1/2 flex justify-center items-start lg:items-center">
          <img src="/whydonate.png" alt="What is Donated Blood Used For?" className='w-full max-w-sm md:max-w-md object-contain rounded-xl shadow-lg' />
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default WhyDonate
