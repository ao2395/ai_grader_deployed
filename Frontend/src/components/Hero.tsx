'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

export default function Hero() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/signup')
  }

  return (
    <section className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-20">
      <div className="container mx-auto px-4">
        {/* Hero Text Content */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Master Math with AI-Powered Learning</h1>
          <p className="text-xl mb-8">Practice, explain, and get instant feedback to improve your math skills.</p>
          <Button 
            onClick={handleGetStarted}
            className="bg-white text-blue-500 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition duration-300"
          >
            Get Started
          </Button>
          
          {/* Demo Video */}
          <div className="mt-12">
            <h3 className="text-lg font-semibold mb-4">See DrawExplain in Action</h3>
            <div className="max-w-2xl mx-auto">
              <div style={{ position: "relative", paddingBottom: "66.66666666666666%", height: 0 }}>
                <iframe 
                  src="https://www.loom.com/embed/eaa97be657c649f0be08b3e26b39f6f5?sid=2d47f61d-dbb6-436f-973a-0e33f3953bf9" 
                  frameBorder="0" 
                  allowFullScreen 
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}