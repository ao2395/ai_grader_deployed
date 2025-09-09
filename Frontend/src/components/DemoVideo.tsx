'use client'

export default function DemoVideo() {
  return (
    <section className="py-16 bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="mb-16" data-aos="fade-up" data-aos-duration="800">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              See DrawExplain in Action
            </h2>
          </div>

          {/* Video Container */}
          <div className="relative max-w-4xl mx-auto" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
            {/* Video Frame with Shadow */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
              {/* Video Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
              
              {/* Video Iframe */}
              <div className="relative" style={{ paddingBottom: "56.25%" }}>
                <iframe 
                  src="https://www.loom.com/embed/eaa97be657c649f0be08b3e26b39f6f5?sid=2d47f61d-dbb6-436f-973a-0e33f3953bf9" 
                  frameBorder="0" 
                  allowFullScreen 
                  className="absolute inset-0 w-full h-full rounded-2xl"
                />
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-purple-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
          </div>


        </div>
      </div>
    </section>
  )
}
