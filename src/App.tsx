import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { useTransition } from "react";
import { Auth0Provider } from "@auth0/auth0-react";
import { Navigation } from "./components/Navigation";
import { ChatBot } from "./components/ChatBot";
import { Cart } from "./components/Cart";
import { About } from "./pages/About";
import { Home } from "./pages/Home";
import { Design } from "./pages/Design/Design";
import { Auth } from "./pages/Auth/Auth";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ProfileLayout } from "./pages/Profile/ProfileLayout";
import { Orders } from "./pages/Orders/Orders";
import { Addresses } from "./pages/Profile/Addresses/Addresses";
import { Wishlist } from "./pages/Profile/Wishlist/Wishlist";
import * as config from "./auth_config.json";
import { getRedirectUri } from "./utils/getRedirectUri";

// Configure future flags for React Router v7
const routerFutureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

function App() {
  const [isPending] = useTransition();

  return (
    <Router future={routerFutureConfig}>
      <Auth0Provider
        domain={config.domain}
        clientId={config.clientId}
        authorizationParams={{
          redirect_uri: getRedirectUri(),
          audience: config.authorizationParams.audience,
        }}
        cacheLocation="localstorage"
        onRedirectCallback={(appState) => {
          window.location.href = appState?.returnTo || window.location.pathname;
        }}
      >
        <CartProvider>
          <AuthProvider>
            <WishlistProvider>
              <div className="min-h-screen bg-white">
                <Navigation />
                {isPending && (
                  <div className="fixed top-0 left-0 w-full h-1">
                    <div
                      className="h-full bg-rose-600 animate-[loading_1s_ease-in-out_infinite]"
                      style={{ width: "25%" }}
                    />
                  </div>
                )}{" "}
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/design/*" element={<Design />} />{" "}
                <Route path="/auth" element={<Auth />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/profile" element={<ProfileLayout />}>
                <Route path="my-designs" element={<Design />} />                  <Route path="wishlist" element={<Wishlist />} />
                  <Route
                    path="payments"
                    element={<div>Payments Coming Soon</div>}
                  />
                  <Route path="addresses" element={<Addresses />} />
                  <Route
                    path="settings"
                    element={<div>Settings Coming Soon</div>}
                  />
                </Route>
              </Routes>              <Cart />
              <ChatBot />{" "}
              </div>
            </WishlistProvider>
          </AuthProvider>
        </CartProvider>
      </Auth0Provider>
    </Router>
  );
}

export default App;
