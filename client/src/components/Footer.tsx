import { Link } from "wouter";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import newLogoPath from "@assets/New-Logo_1749123504535.png";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email submission here
    console.log("Email submitted:", email);
    setEmail("");
  };

  return (
    <footer className="bg-gray-100 text-gray-800 mt-12">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Side - Company Info */}
          <div>
            <img 
              src={newLogoPath} 
              alt="Sign Squad - Specialist in Signs & Printing" 
              className="h-16 w-auto mb-6"
            />
            
            <div className="space-y-2 text-sm text-gray-600">
              <p>5 Roger Street</p>
              <p>Manchester, M4 4EN</p>
              <p className="mt-4">info@signsquad.com</p>
            </div>
            
            <div className="mt-6">
              <Link href="/directions" className="text-sm text-gray-600 hover:text-primary transition-colors inline-flex items-center">
                Get Direction <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            
            {/* Social Media Icons */}
            <div className="flex space-x-3 mt-6">
              <a href="#" className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.219-.359-1.219c0-1.142.662-1.995 1.488-1.995.703 0 1.042.527 1.042 1.16 0 .708-.452 1.766-.686 2.754-.195.823.413 1.495 1.228 1.495 1.474 0 2.608-1.554 2.608-3.804 0-1.99-1.43-3.382-3.475-3.382-2.367 0-3.758 1.774-3.758 3.61 0 .714.275 1.48.618 1.895.068.083.077.156.057.24-.061.254-.196.796-.223.907-.035.146-.116.177-.268.107-1.001-.465-1.624-1.926-1.624-3.1 0-2.523 1.834-4.84 5.287-4.84 2.781 0 4.943 1.98 4.943 4.628 0 2.757-1.739 4.976-4.151 4.976-.811 0-1.573-.421-1.834-.92l-.498 1.902c-.181.695-.669 1.566-.995 2.097.751.232 1.544.357 2.368.357 6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001.017 0z"/>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Right Side - Email Signup */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Sign Up for Email</h3>
            <p className="text-gray-600 mb-6">
              Sign up to get first dibs on new arrivals, sales, exclusive content, events and more!
            </p>
            
            <form onSubmit={handleEmailSubmit} className="mb-8">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button type="submit" className="bg-red-500 hover:bg-red-600 text-white px-6">
                  Subscribe
                </Button>
              </div>
            </form>
            
            <div className="text-sm text-gray-500 mb-4">
              [mc4wp_form id="163"]
            </div>
          </div>
        </div>
        
        {/* Bottom Section - Copyright and Payment Methods */}
        <div className="border-t border-gray-300 mt-12 pt-8 flex flex-col lg:flex-row justify-between items-center">
          <div className="text-sm text-gray-500 mb-4 lg:mb-0">
            Copyright 2025. Designed By SIGNSQUAD
          </div>
          
          {/* Payment Method Icons */}
          <div className="flex space-x-3">
            <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
              VISA
            </div>
            <div className="w-12 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
              P
            </div>
            <div className="w-12 h-8 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">
              MC
            </div>
            <div className="w-12 h-8 bg-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">
              AMEX
            </div>
            <div className="w-12 h-8 bg-black rounded flex items-center justify-center text-white text-xs font-bold">
              Pay
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
