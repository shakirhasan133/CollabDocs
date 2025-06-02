import { useLocation, Link, useNavigate } from "react-router";
import UseAuth from "./../../Hooks/UseAuth";
import logo from "../../assets/logo.png";
import React, { useState, useEffect, useRef } from "react";
import { IoIosClose } from "react-icons/io";
import { PiSignOutBold } from "react-icons/pi";
import { io } from "socket.io-client";

const Navbar = () => {
  const { user, signOutUser } = UseAuth();
  const location = useLocation();
  const { pathname } = location;
  const navigate = useNavigate();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const profileImageRef = useRef(null);

  // console.log(user);

  const menuItems = [
    { path: "/my-documents", label: "My Documents" },
    { path: "/shared", label: "Shared With Me" },
    { path: "/active-user", label: "Active User" },
  ];

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleSignOut = () => {
    signOutUser()
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // Get Active User
  // useEffect(() => {
  //   if (!user) return;
  //   const socket = io(`${import.meta.env.VITE_Api_URL}/active-users`, {
  //     query: {
  //       email: user?.email,
  //       name: user?.displayName,
  //       photoURL: user?.photoURL,
  //     },
  //   });

  //   const handleConnect = () => {
  //     // console.log("Connected to server");
  //   };
  //   const handleDisconnect = () => {
  //     // console.log("Disconnected");
  //   };

  //   socket.on("connect", handleConnect);
  //   socket.on("disconnect", handleDisconnect);

  //   // Cleanup function to avoid multiple sockets
  //   return () => {
  //     socket.disconnect();
  //     socket.off("connect", handleConnect);
  //     socket.off("disconnect", handleDisconnect);
  //   };
  // }, [user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        isProfileMenuOpen &&
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target) &&
        profileImageRef.current &&
        !profileImageRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const firstName = user?.displayName?.split(" ")[0] || "User";

  return (
    <div className="container mx-auto py-2 border-b-2 sticky top-0 z-50 bg-white">
      <section className="flex items-center justify-between ">
        {/* Left Section - Logo */}
        <div className="flex items-center">
          <Link to="/">
            <img src={logo} alt="CollabDocs" className="h-10" />
          </Link>
        </div>

        {/* Middle Section - Dynamic Menu */}
        <nav className="hidden md:flex items-center space-x-1 gap-2">
          {menuItems &&
            menuItems.map((item) => (
              <Link
                key={item.path + item.label}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === item.path
                    ? "bg-gray-700 text-white"
                    : "text-gray-700 hover:bg-gray-200 hover:text-black"
                }`}
              >
                {item.label}
              </Link>
            ))}
        </nav>

        {/* Right Section - User Image & Profile Menu */}
        <div className="relative">
          {user ? (
            <>
              <img
                ref={profileImageRef}
                src={user.photoURL || "https://via.placeholder.com/40"}
                alt={user.displayName || "User"}
                className="w-[40px] h-[40px] rounded-full border-2 border-gray-300 hover:border-blue-500 cursor-pointer object-cover"
                onClick={toggleProfileMenu}
              />
              {isProfileMenuOpen && (
                <div
                  ref={profileMenuRef}
                  className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl z-50 p-5 border border-gray-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-center items-center mb-1">
                    <span
                      className="text-sm text-gray-500 truncate"
                      title={user.email}
                    >
                      {user.email || "user@example.com"}
                    </span>
                  </div>
                  <button
                    onClick={toggleProfileMenu}
                    className="text-gray-400 hover:text-gray-600 p-1 -mr-1 top-2 right-3 absolute"
                  >
                    <IoIosClose className="text-3xl" />
                  </button>

                  <div className="text-center pt-2 pb-4 border-b border-gray-200">
                    <img
                      src={user.photoURL || "https://via.placeholder.com/80"} // Fallback avatar
                      alt={user.displayName || "User"}
                      className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-gray-300 object-cover"
                    />
                    <h2 className="text-lg font-semibold text-gray-800">
                      Hi, {firstName}!
                    </h2>
                  </div>

                  <div className="py-2">
                    <div className="space-y-1 mt-2">
                      <nav className="flex flex-col md:hidden items-center space-x-1 gap-2">
                        {menuItems &&
                          menuItems.map((item) => (
                            <Link
                              key={item.path + item.label}
                              to={item.path}
                              className={`px-3 py-2 rounded-md text-sm font-medium w-full ${
                                pathname === item.path
                                  ? "bg-gray-700 text-white"
                                  : "text-gray-700 hover:bg-gray-200 hover:text-black"
                              }`}
                            >
                              {item.label}
                            </Link>
                          ))}
                      </nav>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center text-gray-700 hover:bg-gray-100 py-2.5 px-3 rounded-lg text-sm transition-colors duration-150"
                      >
                        <PiSignOutBold className="mr-2" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 hover:text-black"
            >
              Login
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Navbar;
