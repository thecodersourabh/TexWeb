import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Scissors, Sparkles, BedDouble, Ruler } from 'lucide-react';
import { Navigation } from './components/Navigation';
import { ChatBot } from './components/ChatBot';
import { About } from './pages/About';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
        <ChatBot />
      </div>
    </Router>
  );
}

function Home() {
  return (
    <>
      {/* Hero Section */}
      <div className="relative h-[500px] bg-cover bg-center" style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1528578950694-9f79b45a3397?auto=format&fit=crop&q=80")'
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Design Your Dream Fabric</h1>
            <p className="text-xl mb-8">Turn your creativity into beautiful custom fabrics</p>
            <button className="bg-rose-600 text-white px-8 py-3 rounded-full hover:bg-rose-700 transition">
              Start Creating
            </button>
          </div>
        </div>
      </div>

      {/* New Product Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block bg-rose-100 text-rose-600 px-4 py-1 rounded-full text-sm font-semibold">
                NEW
              </div>
              <h2 className="text-4xl font-bold">Extra-Wide Cotton Sateen Fabrics</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                With 116" (over 9½ feet!) of printed width, these two 100% cotton fabrics are perfect for large scale projects like bedding, table linens and quilt backings. Now available by the yard featuring your choice of any Spoonflower print.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Ruler className="h-5 w-5" />
                  <span>116" Width</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Scissors className="h-5 w-5" />
                  <span>100% Cotton</span>
                </div>
              </div>
              <button className="bg-rose-600 text-white px-6 py-3 rounded-full hover:bg-rose-700 transition">
                Shop Now
              </button>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80"
                alt="Extra-Wide Cotton Sateen Fabric"
                className="rounded-lg shadow-xl"
              />
              {/* <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="bg-rose-600 p-2 rounded-full">
                    <Ruler className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Extra Wide</p>
                    <p className="text-sm text-gray-600">116" Printed Width</p>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Categories */}
      <div className="max-w-7xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">Featured Collections</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <CategoryCard 
            title="Custom Bedding"
            image="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80"
            icon={<BedDouble className="h-6 w-6" />}
          />
          <CategoryCard 
            title="Designer Prints"
            image="https://images.unsplash.com/photo-1528458909336-e7a0adfed0a5?auto=format&fit=crop&q=80"
            icon={<Sparkles className="h-6 w-6" />}
          />
          <CategoryCard 
            title="Seasonal Fabrics"
            image="https://images.unsplash.com/photo-1544365558-35aa4afcf11f?auto=format&fit=crop&q=80"
            icon={<Scissors className="h-6 w-6" />}
          />
        </div>
      </div>

      {/* Design Challenge Banner bg-rose-50*/}
      <div className=" bg-gray py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col md:flex-row items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Winter Holiday Design Challenge</h3>
              <p className="text-gray-600 mb-4 md:mb-0">Submit your festive designs and win amazing prizes!</p>
            </div>
            <button className="bg-rose-600 text-white px-6 py-3 rounded-full hover:bg-rose-700 transition">
              Join Challenge
            </button>
          </div> */}
        </div>
      </div>
    </>
  );
}

function CategoryCard({ title, image, icon }) {
  return (
    <div className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition">
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0 z-10" />
      <img 
        src={image} 
        alt={title}
        className="w-full h-[300px] object-cover group-hover:scale-105 transition duration-300"
      />
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
        <div className="flex items-center space-x-2 text-white">
          <div className="bg-rose-600 p-2 rounded-full">
            {icon}
          </div>
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
      </div>
    </div>
  );
}

export default App;