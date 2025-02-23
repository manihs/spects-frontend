// components/BrandInfoSection.jsx

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const BrandInfoSection = ({
  brand,
  reverse = false,
  backgroundColor = '#ffffff',
  textColor = '#333333',
  buttonColor = '#4f46e5',
  buttonTextColor = '#ffffff',
  paddingY = '4rem'
}) => {
  const {
    name,
    subtitle,
    description,
    imageUrl,
    imageAlt,
    buttonText = 'View Collection',
    buttonLink = '#'
  } = brand;

  return (
    <section
      className="w-full"
      style={{ backgroundColor, color: textColor, paddingTop: paddingY, paddingBottom: paddingY }}
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 md:gap-12 lg:gap-16 items-center`}>
          {/* Image Column */}
          <div className="w-full md:w-1/2">
            <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-[16/9] rounded-lg overflow-hidden shadow-lg">
              <Image
                src={imageUrl}
                alt={imageAlt || name}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>

          {/* Content Column */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">{name}</h2>
            {subtitle && (
              <h3 className="text-xl md:text-2xl mb-4 font-medium opacity-80">{subtitle}</h3>
            )}
            {description && (
              <div className="mb-6 text-base md:text-lg lg:text-xl opacity-90 max-w-prose">
                {typeof description === 'string' ? (
                  <p>{description}</p>
                ) : (
                  description.map((paragraph, index) => (
                    <p key={index} className={index < description.length - 1 ? 'mb-4' : ''}>
                      {paragraph}
                    </p>
                  ))
                )}
              </div>
            )}
            {buttonText && buttonLink && (
              <div className="mt-2">
               
                  <a
                  href={buttonLink}
                    className="inline-block px-6 py-3 rounded-md text-base md:text-lg font-medium transition-all duration-300 hover:shadow-lg"
                    style={{ backgroundColor: buttonColor, color: buttonTextColor }}
                  >
                    {buttonText}
                  </a>
                
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandInfoSection;