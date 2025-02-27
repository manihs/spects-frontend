import Breadcrumb from '@/components/Breadcrumb'
import HeroSection from '@/components/heroic/heroic'
import { ChevronRight } from 'lucide-react'
import React from 'react'

export default function AboutUsPage() {
  return (
    <div>
      <HeroSection
        title="About Us"
        subtitle="Discover the values and vision that drive our brand forward"
        backgroundImage="/images/brand-hero.jpg"
        overlayColor="rgba(220, 38, 38, 0.6)" // blue overlay
        height="450px"
        buttonText="View Brand Guidelines"
        buttonLink="/brand/guidelines"
        buttonColor="blue"
      />
      <Breadcrumb
        homeElement="Home"
        separator={<ChevronRight className="w-3 h-3 text-gray-400" />}
        containerClasses="flex items-center py-3 px-4 bg-white shadow-sm"
        listClasses="flex items-center space-x-3"
        activeClasses="text-blue-500 font-semibold"
        capitalizeLinks={true}
      />

<AboutUsSection />
<MissionVisionSection />

    </div>
  )
}


const AboutUsSection = () => (
  <div className="relative py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-100 rounded-full"></div>
          <div className="relative z-10 bg-white p-8 rounded-lg shadow-2xl">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              <span className="text-blue-300">About</span> Us
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Vishva Optical Company stands as a renowned entity in the eyewear industry, 
              esteemed for its consistent delivery of high-quality optical products.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Founded and led by Mr. Amit Vadhar, whose expertise dates back to 1995, 
              our company embodies a legacy of reliability and excellence.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          {['Trust', 'Integrity', 'Transparency', 'Professionalism'].map((pillar, index) => (
            <div 
              key={pillar}
              className="group relative overflow-hidden rounded-lg p-6 bg-gradient-to-br from-blue-50 to-white
                         shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-300 transform -skew-x-12"></div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-blue-300 
                           transition-colors duration-300">
                {pillar}
              </h3>
              <div className="w-12 h-1 bg-blue-300 transform origin-left scale-x-0 group-hover:scale-x-100 
                           transition-transform duration-300"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const MissionVisionSection = () => (
  <div className="relative py-20 bg-gray-50">
    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white opacity-50"></div>
    <div className="max-w-7xl mx-auto px-4 relative z-10">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Mission & <span className="text-blue-300">Vision</span>
        </h2>
        <div className="w-24 h-1 bg-blue-300 mx-auto"></div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-12">
        <div className="bg-white rounded-lg p-8 shadow-xl transform hover:-translate-y-2 
                      transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-300 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">M</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 ml-4">Our Mission</h3>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">
            To elevate global eyewear standards by delivering exceptional quality, 
            innovative designs and becoming one of the leading producers worldwide.
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-8 shadow-xl transform hover:-translate-y-2 
                      transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-300 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">V</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 ml-4">Our Vision</h3>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">
            We strive to exceed market expectations through unparalleled craftsmanship, 
            client centricity and sustainable practices, fostering partnerships that promote 
            vision care worldwide.
          </p>
        </div>
      </div>
    </div>
  </div>
);