import { useState } from "react";
import loginImage from "../assets/loginlottie.json";
import Lottie from "lottie-react";
import { FcGoogle } from "react-icons/fc";
import UseAuth from "../Hooks/UseAuth";
import { Link, useNavigate } from "react-router";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import Swal from "sweetalert2";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { logInWithGoogle, SigninWithUserEmail } = UseAuth();
  const [error, setError] = useState("");
  const [showPassword, isShowPassword] = useState(false);
  const navigate = useNavigate();

  // Handle Log in with Google

  const handleLoginWithGoolge = () => {
    logInWithGoogle()
      .then(() => {
        let timerInterval;
        Swal.fire({
          title: "Log in Successful",
          html: "I will redirect within<b></b> milliseconds.",
          timer: 3000,
          timerProgressBar: true,
          didOpen: () => {
            Swal.showLoading();
            const timer = Swal.getPopup().querySelector("b");
            timerInterval = setInterval(() => {
              timer.textContent = `${Swal.getTimerLeft()}`;
            }, 100);
          },
          willClose: () => {
            clearInterval(timerInterval);
          },
        }).then((result) => {
          if (result.dismiss === Swal.DismissReason.timer) {
            navigate("/");
          }
        });
      })
      .catch((error) => {
        console.log(error.message);
      });
  };
  const handleLogin = (e) => {
    e.preventDefault();

    try {
      SigninWithUserEmail(email, password)
        .then(() => {
          let timerInterval;
          Swal.fire({
            title: "Log in Successful",
            html: "I will redirect within <b></b> milliseconds.",
            timer: 3000,
            timerProgressBar: true,
            didOpen: () => {
              Swal.showLoading();
              const timer = Swal.getPopup().querySelector("b");
              timerInterval = setInterval(() => {
                timer.textContent = `${Swal.getTimerLeft()}`;
              }, 100);
            },
            willClose: () => {
              clearInterval(timerInterval);
            },
          }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
              navigate("/");
            }
          });
        })
        .catch((error) => {
          setError(error.message);
          console.log(error.message);
        });
    } catch (error) {
      console.log("Error From LoginPage : error is", error);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-2 py-6">
      <section className="flex flex-col md:flex-row gap-2 w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Left Side - Image */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4 bg-white">
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-2 md:mb-0">
            CollabDocs
          </h1>
          <Lottie
            className="w-60 md:w-[400px] -mt-4 md:-mt-8"
            animationData={loginImage}
          ></Lottie>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex items-center w-full md:w-1/2 p-4">
          <div className="w-full max-w-md bg-white p-4 md:p-8 mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
              Welcome Back!
            </h1>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Log in to continue
            </p>

            <div className="flex items-center justify-center">
              <button
                onClick={handleLoginWithGoolge}
                className="btn flex items-center justify-center gap-1  rounded bg-white shadow-none  "
              >
                <FcGoogle /> <span className="font-bold text-text">Google</span>
              </button>
            </div>
            <p className="text-sm text-gray-600 my-1 text-center">--- or ---</p>

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
                  className="text-black w-full px-4  py-3 rounded-lg border border-gray-300 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="you@example.com"
                />
              </div>

              <div className="mb-6 relative">
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
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="text-text w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="Enter your password"
                />
                <button
                  className="text-black absolute top-[56%] right-3"
                  onClick={(e) => {
                    e.preventDefault();
                    isShowPassword(!showPassword);
                  }}
                >
                  {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                </button>
              </div>

              <p className="text-red-600 my-2">{error && error}</p>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200"
              >
                Sign In
              </button>

              <p className="text-sm text-center text-gray-600 mt-8">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
