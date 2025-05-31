import { useLocation, Link } from "react-router";
import UseAuth from "./../../Hooks/UseAuth";
import logo from "../../assets/logo.png";

const Navbar = () => {
  const { user } = UseAuth();
  const location = useLocation();
  const { pathname } = location;

  const menuItems = {
    "/dashboard": [
      { path: "/dashboard/my-documents", label: "My Documents" },
      { path: "/dashboard/shared", label: "Shared With Me" },
      { path: "/dashboard/active-user", label: "Active User" },
    ],
    "/document": [
      { path: "#", label: "File" },
      { path: "#", label: "Edit" },
      { path: "#", label: "View" },
      { path: "#", label: "Insert" },
      { path: "#", label: "Format" },
      { path: "#", label: "Tools" },
      // Icons shown in your image can be rendered separately as buttons
    ],
    default: [
      { path: "/", label: "🏠 Home" },
      { path: "/about", label: "ℹ️ About" },
    ],
  };

  let currentMenuItems = [];
  if (pathname.startsWith("/dashboard")) {
    currentMenuItems = menuItems["/dashboard"];
  } else if (pathname.startsWith("/members")) {
    currentMenuItems = menuItems["/members"];
  } else if (pathname.startsWith("/collections")) {
    currentMenuItems = menuItems["/collections"];
  } else if (pathname.startsWith("/admin")) {
    currentMenuItems = menuItems["/admin"];
  }

  if (currentMenuItems.length === 0 && menuItems.default) {
    if (pathname === "/") {
      currentMenuItems = menuItems.default;
    }
  }

  return (
    <div className="container mx-auto py-2  border-b-2">
      <section className="flex items-center justify-between ">
        {/* Left Section - Logo */}
        <div>
          <Link to="/">
            <img src={logo} alt="CollabDocs" className="h-10" />
          </Link>
        </div>

        {/* Middle Section - Dynamic Menu */}
        <nav className="flex items-center space-x-4">
          {currentMenuItems &&
            currentMenuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === item.path
                    ? "bg-gray-700 text-white" // অ্যাক্টিভ লিঙ্কের স্টাইল
                    : "text-gray-700 hover:bg-gray-200 hover:text-black" // ইনঅ্যাক্টিভ লিঙ্কের স্টাইল
                }`}
              >
                {item.label}
              </Link>
            ))}
        </nav>

        {/* Right Section - User Image */}
        <div className="rounded-full">
          {user ? (
            <img
              src={user.photoURL}
              alt={user.displayName || "User"}
              className="w-[40px] h-[40px] rounded-full border border-primary"
            />
          ) : (
            <Link to="/login" className="text-gray-700 hover:text-black">
              Login
            </Link> // যদি ইউজার না থাকে
          )}
        </div>
      </section>
    </div>
  );
};

export default Navbar;
