'use client'

import React, { useState } from 'react';
import { ChevronRight, Mail, Phone, MapPin, Clock, Send, ArrowRight, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const HeroSection = () => (
  <div className="relative h-screen md:h-[80vh] w-full overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-500">
    <div className="absolute inset-0 bg-black bg-opacity-40">
      <img 
        src="/api/placeholder/1920/1080" 
        alt="Contact hero" 
        className="w-full h-full object-cover opacity-50"
      />
    </div>
    
    {/* Animated Background Shapes */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
    </div>

    <div className="relative z-10 flex flex-col items-center justify-center h-full text-white p-8">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
          Let's Start a 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-indigo-300">
            {" "}Conversation
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-2xl mx-auto">
          We're here to help bring your vision to life. Reach out and let's create something amazing together.
        </p>
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
          <Button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 rounded-full 
                         text-lg font-semibold transform hover:scale-105 transition-all duration-300">
            Schedule a Call
          </Button>
          <Button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 rounded-full 
                         text-lg font-semibold transform hover:scale-105 transition-all duration-300">
            View Our Location
          </Button>
        </div>
      </div>
    </div>
  </div>
);

const FloatingLabelInput = ({ label, type = "text", ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  return (
    <div className="relative">
      <input
        type={type}
        className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl 
                   focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300
                   peer placeholder-transparent"
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          setIsFocused(false);
          setHasValue(e.target.value !== "");
        }}
        onChange={(e) => setHasValue(e.target.value !== "")}
        {...props}
      />
      <label
        className={`absolute left-4 transition-all duration-300
                   ${(isFocused || hasValue) 
                     ? "-top-2 text-sm text-blue-500 bg-white px-2" 
                     : "top-4 text-gray-500"}`}
      >
        {label}
      </label>
    </div>
  );
};

const ContactForm = () => (
  <div className="bg-white rounded-3xl p-8 shadow-xl transform hover:shadow-2xl 
                  transition-all duration-500 relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
    
    <form className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <FloatingLabelInput label="First Name" placeholder="John" />
        <FloatingLabelInput label="Last Name" placeholder="Doe" />
      </div>
      
      <FloatingLabelInput label="Email Address" type="email" placeholder="john@example.com" />
      <FloatingLabelInput label="Phone Number" type="tel" placeholder="+1 (555) 000-0000" />
      
      <div className="relative">
        <textarea
          rows={4}
          className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl 
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
          placeholder="How can we help you? Tell us about your project..."
        />
      </div>
      
      <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 
                      hover:to-indigo-600 text-white py-6 rounded-xl flex items-center 
                      justify-center space-x-3 text-lg font-semibold transform 
                      hover:scale-[1.02] transition-all duration-300">
        <span>Send Message</span>
        <ArrowRight className="w-5 h-5 animate-pulse" />
      </Button>
    </form>
  </div>
);

const ContactCard = ({ icon: Icon, title, content }) => (
  <Card className="overflow-hidden transform hover:-translate-y-2 transition-all duration-500 
                  hover:shadow-xl bg-white border-0">
    <CardContent className="p-8">
      <div className="flex items-start space-x-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl
                      group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
          <Icon className="w-8 h-8 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
          {title === "Email Us" ? (
            <a href="mailto:info@vishvaoptical.com" 
               className="text-blue-600 hover:text-blue-700 hover:underline text-lg">
              {content}
            </a>
          ) : (
            <p className="text-gray-600 text-lg leading-relaxed">{content}</p>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

const StatsCard = ({ number, label }) => (
  <div className="text-center bg-white p-6 rounded-2xl shadow-lg">
    <div className="text-4xl font-bold text-blue-600 mb-2">{number}</div>
    <div className="text-gray-600">{label}</div>
  </div>
);

const ContactUsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-20">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left Column - Contact Form */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-lg">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Get In <span className="text-blue-600">Touch</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Fill out the form below and we'll get back to you within 24 hours.
              </p>
              <ContactForm />
            </div>
          </div>

          {/* Right Column - Contact Information */}
          <div className="space-y-12">
            {/* <div className="grid grid-cols-2 gap-6">
              <StatsCard number="24/7" label="Support Available" />
              <StatsCard number="1hr" label="Average Response" />
              <StatsCard number="99%" label="Customer Satisfaction" />
              <StatsCard number="50+" label="Expert Team Members" />
            </div> */}

            <div className="grid gap-8">
              <ContactCard
                icon={Mail}
                title="Email Us"
                content="info@vishvaopticalcompany.com"
              />
              
              <ContactCard
                icon={Phone}
                title="Call Us"
                content="+(91) 9819 415 150"
              />
              
              <ContactCard
                icon={MapPin}
                title="Visit Our Office"
                content="10, Sharad kunj , Derasar Lane , Near Gurukul School , Ghatkopar (East), Mumbai, 400 077, India"
              />
              
              <ContactCard
                icon={Clock}
                title="Business Hours"
                content="Monday - Saturday: 9:30 AM - 6:30 PM"
              />
            </div>

            {/* Interactive Map */}
            {/* <div className="rounded-3xl overflow-hidden shadow-xl">
              <div className="relative h-80">
                <img 
                  src="/api/placeholder/800/400" 
                  alt="Office location map" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent">
                  <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-xl font-semibold mb-2">Our Location</h3>
                    <p className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Mumbai, India
                    </p>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Additional Features Section */}
      <div className="bg-white mt-20 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience excellence in customer service and product quality
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: CheckCircle,
                title: "Quality Assurance",
                description: "Premium products with guaranteed satisfaction"
              },
              {
                icon: Clock,
                title: "Fast Response",
                description: "Quick turnaround on all inquiries"
              },
              {
                icon: MapPin,
                title: "Global Reach",
                description: "Serving customers worldwide with excellence"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 text-center
                                      transform hover:-translate-y-2 transition-all duration-300">
                <div className="inline-block p-3 bg-blue-100 rounded-2xl mb-4">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;