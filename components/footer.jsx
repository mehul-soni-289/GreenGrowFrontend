import Link from "next/link"
import { TreePine, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-black/40 via-black/60 to-black/40 backdrop-blur-xl border-t border-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <TreePine className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                GreenGrow
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Join the green revolution and help create a sustainable future through community-driven tree plantation
              initiatives.
            </p>
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center hover:from-emerald-500/40 hover:to-teal-500/40 transition-all cursor-pointer">
                <Facebook className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center hover:from-emerald-500/40 hover:to-teal-500/40 transition-all cursor-pointer">
                <Twitter className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center hover:from-emerald-500/40 hover:to-teal-500/40 transition-all cursor-pointer">
                <Instagram className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center hover:from-emerald-500/40 hover:to-teal-500/40 transition-all cursor-pointer">
                <Linkedin className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/#features" className="block text-gray-300 hover:text-emerald-400 transition-colors text-sm">
                Features
              </Link>
              <Link
                href="/explore-events"
                className="block text-gray-300 hover:text-emerald-400 transition-colors text-sm"
              >
                Explore Events
              </Link>
              <Link
                href="/organize-events"
                className="block text-gray-300 hover:text-emerald-400 transition-colors text-sm"
              >
                Organize Events
              </Link>
              <Link
                href="/recommend-plants"
                className="block text-gray-300 hover:text-emerald-400 transition-colors text-sm"
              >
                Recommendations
              </Link>
              <Link
                href="/disease-detection"
                className="block text-gray-300 hover:text-emerald-400 transition-colors text-sm"
              >
                Disease Detection
              </Link>
              <Link
                href="/talk-with-tree"
                className="block text-gray-300 hover:text-emerald-400 transition-colors text-sm"
              >
                Talk with Tree
              </Link>
              <Link href="/profile" className="block text-gray-300 hover:text-emerald-400 transition-colors text-sm">
                Profile
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Support</h3>
            <div className="space-y-2">
              <Link href="#" className="block text-gray-300 hover:text-emerald-400 transition-colors text-sm">
                Help Center
              </Link>
              <Link href="#" className="block text-gray-300 hover:text-emerald-400 transition-colors text-sm">
                Community Guidelines
              </Link>
              <Link href="#" className="block text-gray-300 hover:text-emerald-400 transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link href="#" className="block text-gray-300 hover:text-emerald-400 transition-colors text-sm">
                Terms of Service
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span className="text-gray-300 text-sm">hello@greengrow.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span className="text-gray-300 text-sm">+91 9537255427</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span className="text-gray-300 text-sm">LJ university</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-emerald-500/20 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 GreenGrow. All rights reserved. Made with 💚 for a greener planet.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
