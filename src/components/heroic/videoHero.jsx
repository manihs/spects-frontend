// components/VideoHero.jsx

'use client'

import React, { useState, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const VideoHero = ({
  videoUrl,
  title,
  subtitle,
  buttonText,
  buttonLink,
  overlayColor = 'rgba(0, 0, 0, 0.4)',
  height = 'h-screen',
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className={`relative w-full ${height} overflow-hidden`}>
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="object-cover w-full h-full"
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Overlay */}
        <div 
          className="absolute inset-0 w-full h-full" 
          style={{ backgroundColor: overlayColor }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl sm:text-2xl text-white/90 mb-8">
              {subtitle}
            </p>
          )}
          {buttonText && buttonLink && (
            <a
              href={buttonLink}
              className="inline-block px-8 py-4 bg-white text-gray-900 rounded-lg 
                         font-semibold text-lg transition-all duration-300 
                         hover:bg-gray-100 hover:scale-105"
            >
              {buttonText}
            </a>
          )}
        </div>
      </div>

      {/* Mute/Unmute Button */}
      <button
        onClick={toggleMute}
        className="absolute bottom-8 right-8 z-20 p-3 rounded-full 
                   bg-black/50 text-white hover:bg-black/70 
                   transition-all duration-300"
        aria-label={isMuted ? "Unmute video" : "Mute video"}
      >
        {isMuted ? (
          <VolumeX className="w-6 h-6" />
        ) : (
          <Volume2 className="w-6 h-6" />
        )}
      </button>
    </div>
  );
};

export default VideoHero;