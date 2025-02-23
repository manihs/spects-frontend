import CollectionsSection from '@/components/CollectionsSection'
import VideoHero from '@/components/heroic/videoHero'
import ProductSection from '@/components/ProductSection'
import TarotReading from '@/components/TarotReading'
import React from 'react'

export default function page() {
  return (
    <div>

      <VideoHero
        videoUrl="/videos/hero-background.mp4"
        title="Welcome to Our World"
        subtitle="Experience innovation and creativity in every frame"
        buttonText="Explore More"
        buttonLink="/about"
        overlayColor="rgba(0, 0, 0, 0.5)"
        height='h-[640px]'
      />

      <ProductSection
        title="New Arrivals"
        apiUrl="/api/product"
        queryParams={{
          sortBy: 'updatedAt',
          order: 'DESC'
        }}
        productsToShow={8}
        viewAllLink="/collections/new-arrivals"
      />

      <CollectionsSection/>

      <ProductSection
        title="New Arrivals"
        apiUrl="/api/product"
        queryParams={{
          collection: 'aspect',
          category: 'men',
          sortBy: 'updatedAt',
          order: 'DESC'
        }}
        productsToShow={8}
        viewAllLink="/collections/new-arrivals"
      />

    </div>
  )
}
