// components/BrandInfoSection.jsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const BrandInfoSection = ({
  brand,
  reverse = false
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
    <section className="w-full py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 items-center`}>
          {/* Image Column */}
          <div className="w-full md:w-1/2">
            <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-md">
              <Image
                src={imageUrl}
                alt={imageAlt || name}
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
          
          {/* Content Column */}
          <div className="w-full md:w-1/2">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{name}</h2>
            
            {subtitle && (
              <h3 className="text-lg md:text-xl mb-3 text-gray-600">{subtitle}</h3>
            )}
            
            {description && (
              <div className="mb-4 text-gray-700">
                {typeof description === 'string' ? (
                  <p>{description}</p>
                ) : (
                  description.map((paragraph, index) => (
                    <p key={index} className={index < description.length - 1 ? 'mb-3' : ''}>
                      {paragraph}
                    </p>
                  ))
                )}
              </div>
            )}
            
            {buttonText && buttonLink && (
              <Link
                href={buttonLink}
                className="inline-block px-5 py-2 bg-blue-300 text-white rounded hover:bg-blue-400 transition-colors font-medium"
              >
                {buttonText}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandInfoSection;