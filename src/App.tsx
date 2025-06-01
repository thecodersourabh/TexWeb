import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { useTransition } from "react";
import { Navigation } from "./components/Navigation";
import { ChatBot } from "./components/ChatBot";
import { Cart } from "./components/Cart";
import { About } from "./pages/About";
import { Home } from "./pages/Home";
import { CartProvider } from "./context/CartContext";

// Configure future flags for React Router v7
const routerFutureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

function App() {
  const [isPending] = useTransition();

  return (
    <Router future={routerFutureConfig}>
      <CartProvider>
        <div className="min-h-screen bg-white">
          <Navigation />
          {isPending && (
            <div className="fixed top-0 left-0 w-full h-1">
              <div
                className="h-full bg-rose-600 animate-[loading_1s_ease-in-out_infinite]"
                style={{ width: "25%" }}
              />
            </div>
          )}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Routes>
          <Cart />
          <ChatBot />
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;
