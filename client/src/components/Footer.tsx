import { Link } from "wouter";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">PlateCustomizer</h3>
            <p className="text-sm text-gray-400">
              The UK's premier number plate customization service, providing high-quality, legal plates for all vehicles.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="text-gray-400 hover:text-white transition-colors">Home</a>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <a className="text-gray-400 hover:text-white transition-colors">About Us</a>
                </Link>
              </li>
              <li>
                <Link href="/shop">
                  <a className="text-gray-400 hover:text-white transition-colors">Shop</a>
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  <a className="text-gray-400 hover:text-white transition-colors">FAQ</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms">
                  <a className="text-gray-400 hover:text-white transition-colors">Terms & Conditions</a>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <a className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy">
                  <a className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
                </Link>
              </li>
              <li>
                <Link href="/legal">
                  <a className="text-gray-400 hover:text-white transition-colors">Legal Information</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Contact Us</h4>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-400 hover:text-white transition-colors">
                <Mail className="mr-2 h-5 w-5" /> info@signsquad.co.uk
              </li>
              <li className="flex items-center text-gray-400 hover:text-white transition-colors">
                <Phone className="mr-2 h-5 w-5" /> 07429269149 / 07989440141
              </li>
              <li className="flex items-center text-gray-400 hover:text-white transition-colors">
                <MapPin className="mr-2 h-5 w-5" /> 3 Roger Street, Manchester, M4 4EN, United Kingdom
              </li>
            </ul>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} PlateCustomizer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
