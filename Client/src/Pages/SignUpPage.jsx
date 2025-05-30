import { useState } from "react";
import loginImage from "../assets/loginlottie.json";
import Lottie from "lottie-react";
import { FcGoogle } from "react-icons/fc";
import UseAuth from "../Hooks/UseAuth";
import { Link, useNavigate } from "react-router";
import { imageUpload } from "../Utils/utils";
import Swal from "sweetalert2";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, isShowPassword] = useState(false);
  const {
    setUser,
    logInWithGoogle,
    SigninWithUserEmail,
    signUpNewUser,
    updateUserData,
  } = UseAuth();
  const [error, setError] = useState("");
  const [image, setImage] = useState("");
  const navigate = useNavigate();

  // Handle Log in with Google

  const handleLoginWithGoolge = () => {
    logInWithGoogle()
      .then((result) => {
        // console.log(result);
        setUser(result?.user);
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  const handleImage = async (data) => {
    const imageurl = await imageUpload(data);
    setImage(imageurl);
  };

  // Handle Sign Up

  const handleSignUp = (e) => {
    e.preventDefault();
    const form = e.target;

    const email = form.email.value;
    const password = form.password.value;
    const name = form.name.value;

    try {
      signUpNewUser(email, password)
        .then(async (data) => {
          await updateUserData(name, image);

          let timerInterval;
          Swal.fire({
            title: "Auto close alert!",
            html: "I will close in <b></b> milliseconds.",
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
            /* Read more about handling dismissals below */
            if (result.dismiss === Swal.DismissReason.timer) {
              setUser(data.user);
              navigate("/dashboard");
            }
          });
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="h-auto w-full flex items-center flex-col justify-center bg-background">
      <section className="flex  gap-2 w-4xl bg-white rounded-xl shadow-2xl my-10">
        {/* Left Side - Image */}
        <div className="w-1/2  overflow-hidden flex flex-col items-center justify-center ">
          <h1 className="text-4xl font-bold text-black">CollabDocs</h1>
          <Lottie
            className="w-[400px] -mt-8 "
            animationData={loginImage}
          ></Lottie>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex items-center w-1/2">
          <div className="w-full max-w-md bg-white p-8 ">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
              Register
            </h1>
            <p className="text-sm text-gray-600 mb-2 text-center">
              Log in with
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

            <form onSubmit={handleSignUp}>
              <div className="mb-6">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="text-black w-full px-4  py-3 rounded-lg border border-gray-300 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition duration-200"
                  placeholder="you@example.com"
                />
              </div>
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

              <div className="mb-6">
                <label
                  htmlFor="file"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="file"
                    className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow hover:bg-blue-700 transition"
                  >
                    Choose File
                  </label>
                  <span className="text-gray-500 text-sm">
                    {image ? (
                      <img
                        src={image}
                        alt="Selected file preview"
                        className="h-12 w-12 object-cover rounded"
                      />
                    ) : (
                      "No file selected"
                    )}
                  </span>
                </div>
                <input
                  id="file"
                  type="file"
                  onChange={(e) => handleImage(e.target.files[0])}
                  required
                  className="hidden"
                />
              </div>

              <p className="text-red-600 my-2">{error && error}</p>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200"
              >
                Sign Up
              </button>

              <p className="text-sm text-center text-gray-600 mt-8">
                Already have a account?{" "}
                <Link
                  to={"/"}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SignUpPage;
