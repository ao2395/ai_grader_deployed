import { Button } from "@/components/ui/button";


export default function CTA() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-24">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4" data-aos="fade-up" data-aos-duration="800">Ready to Improve Your Math Skills?</h2>
        <p className="text-xl mb-8" data-aos="fade-up" data-aos-duration="800" data-aos-delay="200">Join DrawExplain today and experience the future of math learning.</p>
        <Button asChild className="bg-white text-blue-500 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition duration-300" data-aos="fade-up" data-aos-duration="800" data-aos-delay="400">
          <a href="/signup">Get Started for Free</a>
        </Button>
      </div>
    </section>
  )
}

