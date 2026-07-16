import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";


import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Ranking from "./pages/Ranking";
import TrackOrder from "./pages/TrackOrder";
import CustomBurger from "./pages/CustomBurger";

import Ratings from "./pages/Ratings";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import FloatingCartButton from "./components/FloatingCartButton";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/menu" component={Menu} />
      <Route path="/cart" component={Cart} />
      <Route path="/ranking" component={Ranking} />
      <Route path="/rastrear" component={TrackOrder} />
      <Route path="/criar-lanche" component={CustomBurger} />

      <Route path="/avaliacoes" component={Ratings} />
      <Route path="/admin" component={() => {
        const isLoggedIn = !!localStorage.getItem('adminToken');
        return isLoggedIn ? <AdminDashboard /> : <AdminLogin />;
      }} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <FloatingCartButton />
            <Router />
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
