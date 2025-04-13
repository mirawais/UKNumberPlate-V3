import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

const Navbar = () => {
  const [cartCount, setCartCount] = useState(0);

  // Get cart count from localStorage or API
  const { data: cartData } = useQuery<{ count: number }>({
    queryKey: ['/api/cart/count'],
  });
  
  // Update cart count when data changes
  useEffect(() => {
    if (cartData) {
      setCartCount(cartData.count);
    }
  }, [cartData]);

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-primary cursor-pointer">PlateCustomizer</h1>
          </Link>
        </div>
        
        <nav className="hidden md:flex space-x-6">
          <Link href="/">
            <a className="text-gray-700 hover:text-primary">Home</a>
          </Link>
          <Link href="/shop">
            <a className="text-gray-700 hover:text-primary">Shop</a>
          </Link>
          <Link href="/about">
            <a className="text-gray-700 hover:text-primary">About</a>
          </Link>
          <Link href="/contact">
            <a className="text-gray-700 hover:text-primary">Contact</a>
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-4 mt-8">
                <Link href="/">
                  <a className="text-gray-700 hover:text-primary py-2">Home</a>
                </Link>
                <Link href="/shop">
                  <a className="text-gray-700 hover:text-primary py-2">Shop</a>
                </Link>
                <Link href="/about">
                  <a className="text-gray-700 hover:text-primary py-2">About</a>
                </Link>
                <Link href="/contact">
                  <a className="text-gray-700 hover:text-primary py-2">Contact</a>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
