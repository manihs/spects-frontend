// components/HeroSection.jsx

import React from 'react';
import Image from 'next/image';

const HeroSection = ({
  title,
  subtitle,
  backgroundImage,
  overlayColor = 'rgba(0, 0, 0, 0.6)',
  textColor = 'white',
  height = '500px',
  buttonText,
  buttonLink,
  buttonColor = 'primary',
}) => {
  return (
    <div 
      className="relative w-full"
      style={{ height }}
    >
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={backgroundImage}
          alt="Background"
          layout="fill"
          objectFit="cover"
          priority
        />
        {/* Overlay */}
        <div 
          className="absolute inset-0 w-full h-full" 
          style={{ backgroundColor: overlayColor }}
        />
      </div>
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl">
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
            style={{ color: textColor }}
          >
            {title}
          </h1>
          {subtitle && (
            <p 
              className="text-lg sm:text-xl md:text-2xl mb-8"
              style={{ color: textColor }}
            >
              {subtitle}
            </p>
          )}
          {buttonText && buttonLink && (
            <a
              href={buttonLink}
              className={`inline-block px-6 py-3 rounded-md text-white bg-${buttonColor} hover:bg-${buttonColor}-600 transition-colors duration-300`}
            >
              {buttonText}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;