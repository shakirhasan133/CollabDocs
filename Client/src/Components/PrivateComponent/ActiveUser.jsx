import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import LoadingPage from "../../Pages/LoadingPage";
import UseAuth from "../../Hooks/UseAuth";

const ActiveUser = () => {
  const [activeUser, setActiveUser] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = UseAuth();

  // Get Active User
  useEffect(() => {
    if (!user) return;
    const socket = io(`${import.meta.env.VITE_Api_URL}/active-users`, {
      query: {
        email: user?.email,
        name: user?.displayName,
        photoURL: user?.photoURL,
      },
    });

    const handleConnect = () => {
      socket.on("getActive-User", (activeUserList) => {
        setActiveUser(activeUserList);
        setLoading(false);
      });
    };
    const handleDisconnect = () => {
      console.log("Disconnected");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    // Cleanup function to avoid multiple sockets
    return () => {
      socket.disconnect();
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [user]);

  if (loading || !user) {
    return <LoadingPage />;
  }

  return (
    <div className="container mx-auto min-h-screen px-2 sm:px-4">
      <section className=" py-5">
        <h1 className="text-2xl sm:text-3xl text-gray-800 font-bold py-5">
          Active Users
        </h1>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 shadow-sm">
          <table className="w-full min-w-[540px]">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider w-16 sm:w-20">
                  Photo
                </th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider min-w-[150px]">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider min-w-[200px]">
                  Email
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeUser.length > 0 ? (
                activeUser.map((user, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap w-16 sm:w-20">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          src={user.photoURL || "https://placehold.co/40"}
                          alt={`${user.name}'s photo`}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap min-w-[150px]">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap min-w-[200px]">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No active users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default ActiveUser;
