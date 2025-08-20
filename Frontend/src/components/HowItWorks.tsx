export default function HowItWorks() {
    const steps = [
      { number: 1, title: "Sign Up", description: "Create your account" },
      { number: 2, title: "Practice", description: "Solve math problems" },
      { number: 3, title: "Explain", description: "Record your thought process" },
      { number: 4, title: "Improve", description: "Get AI feedback and learn" }
    ]
  
    return (
      <section id="how-it-works" className="py-24 bg-gradient-to-br from-slate-800 via-gray-900 to-slate-800 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16" data-aos="fade-up" data-aos-duration="800">How DrawExplain Works</h2>
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                          {steps.map((step, index) => (
                <div key={index} className="w-full md:w-1/5 text-center mb-8 md:mb-0" data-aos="fade-up" data-aos-duration="800" data-aos-delay={index * 200}>
                  <div className="relative">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <span className="text-2xl font-bold text-white">{step.number}</span>
                    </div>
                    {/* Connection line for desktop */}
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 transform translate-x-1/2"></div>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">{step.title}</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">{step.description}</p>
                </div>
              ))}
          </div>
        </div>
      </section>
    )
  }