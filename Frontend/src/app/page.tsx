'use client'

import LandingPageHeader from "@/components/LandingPageHeader";
import Hero from "@/components/Hero";
import DemoVideo from "@/components/DemoVideo";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function LandingPage() {
  useEffect(() => {
    // Initialize AOS locally
    console.log('AOS library loaded:', AOS);
    try {
      AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: false, // Allow animations to repeat
        offset: 50, // Smaller offset for more responsive animations
        mirror: true, // Enable animations when scrolling up
        anchorPlacement: 'center-bottom' // Better trigger point
      });
      console.log('AOS initialized successfully');
      
      // Refresh AOS on scroll to ensure smooth animations
      const handleScroll = () => {
        AOS.refresh();
      };
      
      // Initial refresh to ensure animations work after page load
      setTimeout(() => {
        AOS.refresh();
      }, 100);
      
      window.addEventListener('scroll', handleScroll);
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    } catch (error) {
      console.error('Error initializing AOS:', error);
    }
  }, []);

  return (
    <main className='min-h-screen bg-gray-100'>
      <LandingPageHeader />
      <Hero />
      <DemoVideo />
      <HowItWorks />
      <Features />
      <CTA />
      <Footer />
    </main>
  );
}
