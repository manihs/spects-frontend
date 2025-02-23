import BrandInfoSection from '@/components/basic/BrandInfoSection';
import Breadcrumb from '@/components/Breadcrumb';
import HeroSection from '@/components/heroic/heroic'
import { ChevronRight } from 'lucide-react';
import React from 'react'

export default function page() {

  const brands = [
    {
      id: 'brand1',
      name: 'VICTOR EYEWEAR',
      subtitle: 'A new way to see',
      description: [
        'This curated collection of victor eyewear offers a spectrum of colours in each model, designed to compliment every unique personality and preferences. Our commitment to craftsmanship ensures every pair is crafted with precision and care, offering not just an eyewear, but an expression of refined taste and personal style at an economic price.'
      ],
      imageUrl: '/images/luxe-brand.jpg',
      imageAlt: 'Luxe Couture brand showcase',
      buttonText: 'Explore Luxe Collection',
      buttonLink: '/collections/luxe'
    },
    {
      id: 'brand2',
      name: 'RALPH CARLO',
      subtitle: 'Before it is in fashion, it is in Ralph Carlo',
      description: 'This exclusive collection of eyewear offers sophistication and elegance. Whether you are seeking a timeless pair for everyday wear or a statement piece for special occasion, our eyewear offers versatility and style. Embrace the uniqueness of our collection as our frames promise to meet your expectations in both quality and aesthetics.',
      imageUrl: '/images/urban-brand.jpg',
      imageAlt: 'Urban Edge brand showcase',
      buttonText: 'Shop Urban Edge',
      buttonLink: '/collections/urban-edge'
    }
  ];


  return (
    <div>
      <HeroSection
        title="Our Brand Story"
        subtitle="Discover the values and vision that drive our brand forward"
        backgroundImage="/images/brand-hero.jpg"
        overlayColor="rgba(220, 38, 38, 0.6)" // Red overlay
        height="450px"
        buttonText="View Brand Guidelines"
        buttonLink="/brand/guidelines"
        buttonColor="red"
      />

      <Breadcrumb
        homeElement="Home"
        separator={<ChevronRight className="w-3 h-3 text-gray-400" />}
        containerClasses="flex items-center py-3 px-4 bg-white shadow-sm"
        listClasses="flex items-center space-x-3"
        activeClasses="text-blue-500 font-semibold"
        capitalizeLinks={true}
      />

      <div className="">
        {brands.map((brand, index) => (
          <BrandInfoSection
            key={brand.id}
            brand={brand}
            reverse={index % 2 !== 0} // Alternate layout
            backgroundColor={index % 2 === 0 ? '#ffffff' : '#f8f9fa'}
            buttonColor={index % 2 === 0 ? '#4f46e5' : '#6366f1'}
          />
        ))}
      </div>

    </div>
  )
}
