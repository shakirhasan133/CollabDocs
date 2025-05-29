import React, { useState } from "react";
import loginImage from "../assets/loginlottie.json";
import Lottie from "lottie-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Email:", email, "Password:", password);
    // Example: You might want to send this to a backend API
  };

  return (
    <div className="h-screen w-full flex items-center flex-col justify-center bg-background">
      <section className="flex p-5  gap-2 w-4xl bg-white rounded-xl shadow-2xl">
        {/* Left Side - Image */}
        <div className="w-1/2  overflow-hidden flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold">CollabDocs</h1>
          <Lottie className="w-[400px]" animationData={loginImage}></Lottie>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex items-center w-1/2">
          <div className="w-full max-w-md bg-white p-8 ">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
              Welcome Back!
            </h1>
            <p className="text-sm text-gray-600 mb-8 text-center">
              Please sign in to continue
            </p>

            <form onSubmit={handleLogin}>
              <div className="mb-6">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="you@example.com"
                />
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <a href="#" className="text-xs text-blue-600 hover:underline">
                    Forgot password?
                  </a>
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200"
              >
                Sign In
              </button>

              <p className="text-sm text-center text-gray-600 mt-8">
                Don't have an account?{" "}
                <a
                  href="#"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign up
                </a>
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
