
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-poa-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-poa-red-100 text-poa-red-600 mb-6">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold text-poa-gray-900 mb-2">404</h1>
        <p className="text-xl text-poa-gray-600 mb-6">
          Oops! Page not found
        </p>
        <p className="text-poa-gray-600 mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link to="/">
          <Button className="bg-poa-blue-600 hover:bg-poa-blue-700">
            <Home className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
