import { Link } from "react-router";
import Lottie from "lottie-react";
import Errorpage from "../assets/ErrorPage.json";

const ErrorPage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center py-12 px-4">
      {/* Lottie Animation */}
      <Lottie className="w-80 h-auto mb-8" animationData={Errorpage}></Lottie>

      {/* Error Title */}
      <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
        404 - Page Not Found
      </h1>

      {/* Error Description */}
      <p className="text-base md:text-lg text-muted mb-8 max-w-lg">
        Oops! The page you're looking for doesn't exist or may have been moved.
        But no worries, you can head back to the homepage to continue exploring!
      </p>

      {/* Back to Home Button */}
      <Link
        to="/"
        className="bg-primary hover:bg-primary-dark text-white py-3 px-8 rounded-lg text-base md:text-lg font-medium shadow-btn transition-all duration-300"
      >
        Return to Home
      </Link>
    </div>
  );
};

export default ErrorPage;
