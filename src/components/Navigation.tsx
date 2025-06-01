import { Link } from "react-router-dom";
import { Scissors, Heart, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";

export function Navigation() {
  const { setIsCartOpen, items } = useCart();
  return (
    <nav className="bg-white border-b border-gray-100 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2">
            <Scissors className="h-6 w-6 text-rose-600" />
            <span className="text-xl font-semibold">FabricCraft</span>
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-gray-900">
              About
            </Link>
            <Link to="/design" className="text-gray-600 hover:text-gray-900">
              Create Own Design
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <button className="text-gray-600 hover:text-gray-900">
            <Heart className="h-5 w-5" />
          </button>
          <button
            onClick={() => setIsCartOpen(true)}
            className="text-gray-600 hover:text-gray-900 relative"
          >
            <ShoppingCart className="h-5 w-5" />
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {items.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
