// components/Breadcrumb.jsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = ({
  homeElement = 'Home',
  separator = <ChevronRight className="w-4 h-4" />,
  containerClasses = 'flex items-center py-4 px-4 bg-gray-50',
  listClasses = 'flex items-center space-x-2',
  activeClasses = 'text-gray-600',
  capitalizeLinks = true
}) => {
  const paths = usePathname();
  
  const pathNames = paths.split('/').filter(path => path);
  
  // Function to generate link path
  const getPathLink = (index) => {
    const segments = pathNames.slice(0, index + 1);
    return `/${segments.join('/')}`;
  };

  // Function to format breadcrumb text
  const formatText = (text) => {
    if (!text) return '';
    // Remove hyphens and underscores
    let formattedText = text.replace(/[-_]/g, ' ');
    // Capitalize if the option is enabled
    if (capitalizeLinks) {
      formattedText = formattedText
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    return formattedText;
  };

  return (
    <nav aria-label="breadcrumb" className={containerClasses}>
      <ol className={listClasses}>
        <li className="flex items-center">
          <Link 
            href="/"
            className="text-gray-700 hover:text-blue-600 flex items-center"
          >
            <Home className="w-4 h-4 mr-1" />
            {homeElement}
          </Link>
        </li>

        {pathNames.length > 0 && <li className="flex items-center ml-2">{separator}</li>}

        {pathNames.map((name, index) => {
          const isLast = index === pathNames.length - 1;
          
          return (
            <React.Fragment key={index}>
              <li className="flex items-center">
                {isLast ? (
                  <span className={activeClasses}>
                    {formatText(name)}
                  </span>
                ) : (
                  <Link
                    href={getPathLink(index)}
                    className="text-gray-700 hover:text-blue-600"
                  >
                    {formatText(name)}
                  </Link>
                )}
              </li>
              {!isLast && (
                <li className="flex items-center ml-2">
                  {separator}
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;