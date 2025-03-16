import { Link } from 'react-router-dom';
import { Scissors, Heart, ShoppingCart } from 'lucide-react';

export function Navigation() {
  return (
    <nav className="bg-white border-b border-gray-100 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2">
            <Scissors className="h-6 w-6 text-rose-600" />
            <span className="text-xl font-semibold">FabricCraft</span>
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
            <Link to="/about" className="text-gray-600 hover:text-gray-900">About</Link>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <button className="text-gray-600 hover:text-gray-900">
            <Heart className="h-5 w-5" />
          </button>
          <button className="text-gray-600 hover:text-gray-900">
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}