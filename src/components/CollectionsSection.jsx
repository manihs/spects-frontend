// components/CollectionsSection.jsx
'use client';

import React from 'react';
import Link from 'next/link';

const CollectionBox = ({ title, image, link, size = 'normal' }) => {
    return (
        <Link
            href={link}
            className={`group relative overflow-hidden rounded-2xl ${size === 'large' ? 'row-span-2' : 'row-span-1'
                }`}
        >
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0" />
            <div className="relative h-full flex flex-col justify-end p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">{title}</h3>
                <div className="transform translate-y-8 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="inline-flex items-center text-sm font-medium">
                        Shop Now
                        <svg
                            className="w-4 h-4 ml-2 transform transition-transform duration-300 group-hover:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </span>
                </div>
            </div>
        </Link>
    );
};

const CollectionsSection = ({
    title = "",
    collections = [
        {
            id: 1,
            title: "Men's",
            image: "/home/man.jpg",
            link: "/products?category=men",
            size: "normal"
        },
        {
            id: 2,
            title: "Women's",
            image: "/home/women.jpg",
            link: "/products?category=women",
            size: "normal"
        },
        {
            id: 3,
            title: "Unisex",
            image: "/home/unsex.jpg",
            link: "/products?category=unisex",
            size: "normal"
        }
    ]
}) => {
    return (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-50">
            <div className="max-w-7xl mx-auto">
                
                    {title && (
                        <div className="text-center mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                            {title}
                        </h2>
                        </div>
                    )}
               

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[300px]">
                    {collections.map((collection) => (
                        <CollectionBox
                            key={collection.id}
                            title={collection.title}
                            image={collection.image}
                            link={collection.link}
                            size={collection.size}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CollectionsSection;