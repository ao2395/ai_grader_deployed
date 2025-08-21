import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between">
          {/* Company Info */}
          <div className="w-full md:w-1/4 mb-6 md:mb-0">
            <h3 className="text-xl font-semibold mb-4">DrawExplain</h3>
            <p className="text-gray-600 text-center">
              Draw it, explain it, master it
            </p>
          </div>
          {/* Quick Links */}
          <div className="w-full md:w-1/4 mb-6 md:mb-0">
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-gray-400 hover:text-white">Home</Link></li>
              <li><Link href="#features" className="text-gray-400 hover:text-white">Features</Link></li>
              <li><Link href="#how-it-works" className="text-gray-400 hover:text-white">How It Works</Link></li>

            </ul>
          </div>
          {/* Contact Info */}
          <div className="w-full md:w-1/4 mb-6 md:mb-0">
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <p className="text-gray-400">Email: sa6097@nyu.edu</p>
          </div>

        </div>
        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-center text-gray-400">
          © {currentYear} DrawExplain. All rights reserved.
        </div>
      </div>
    </footer>
  )
}