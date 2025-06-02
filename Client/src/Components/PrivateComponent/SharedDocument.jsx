import { useEffect, useState, useRef } from "react";
// import defaultImg from "../../assets/doc.png";
import LoadingPage from "../../Pages/LoadingPage";
import { useNavigate } from "react-router";
import { CiMenuKebab } from "react-icons/ci";
import UseAuth from "../../Hooks/UseAuth";
import { io } from "socket.io-client";

const SharedDocument = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const menuRefs = useRef([]);
  const navigate = useNavigate();
  const { user } = UseAuth();

  const myFileSocketRef = useRef(null);
  // const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Prevent connecting if no user yet
    if (!user?.email) return;

    const socket = io(`${import.meta.env.VITE_Api_URL}/shared-documents`, {
      withCredentials: true,
      transports: ["websocket"],
      query: { email: user?.email },
    });

    myFileSocketRef.current = socket;

    const handleConnect = () => {
      // console.log("Connected to socket:", socket.id);
      socket.emit("sendEmail", { email: user.email });

      socket.on("sharedDocuments", (data) => {
        if (data.status === 404) {
          console.log("Server Data Fetch Error");
        }
        // console.log(data);
        setDocuments(data);
        setLoading(false);
      });
    };

    const handleDisconnect = () => {
      // console.log("Disconnected from server");
      // setIsConnected(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    // Mark as connected
    // setIsConnected(true);

    // Cleanup function to avoid multiple sockets
    return () => {
      socket.disconnect();
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [user?.email]);

  const handleNewDocument = () => {
    navigate("/new-document");
  };

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        openMenuIndex !== null &&
        menuRefs.current[openMenuIndex] &&
        !menuRefs.current[openMenuIndex].contains(event.target)
      ) {
        setOpenMenuIndex(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuIndex]);

  return (
    <div>
      <section className="container mx-auto px-2 sm:px-4 py-4 h-full min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h1 className="text-black text-2xl sm:text-3xl font-bold">
            Shared documents with me
          </h1>
          <button className="btn w-full sm:w-auto" onClick={handleNewDocument}>
            Create New Documents
          </button>
        </div>

        {/* Content */}

        {loading && <LoadingPage></LoadingPage>}

        {documents.length === 0 && (
          <div className="flex items-center justify-center w-full h-screen">
            <h1 className="text-red-500 font-bold text-md">
              No Document created
            </h1>
          </div>
        )}

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 my-5 gap-4">
          {Array.isArray(documents) &&
            documents.map((doc, index) => {
              const title =
                doc.title.length > 25
                  ? doc.title.slice(0, 25) + "..."
                  : doc.title;
              return (
                <div
                  className="relative p-2 sm:p-3 border-2 rounded-md hover:border hover:border-primary transition-all delay-75 cursor-pointer bg-white shadow-sm flex flex-col"
                  key={index}
                >
                  <div className="w-full rounded overflow-hidden">
                    <img
                      src={
                        doc?.thumbnailUrl
                          ? doc?.thumbnailUrl
                          : "https://lh3.googleusercontent.com/aida-public/AB6AXuBQN3JCRNBXOSYVY55dHhH71UiupwzTEk1pNgYXBVWNFIWjdpZ2v7z8mxJxXouzx31CqcvTzkhrimECXilTGCvS3nzTZtnVvQsS2TvZLJU3-qDTExCVur_MP5ymO2sehOJJ0vJ9s61OC4mNYR4Y4xGzBRo6sEI2-KBCLtKHne6lWXQHLHY2RlUU9cLdMvtMiDcFoFWKrlDqssxgF4C8n_OHmBJGzChpk4NgWE-07arKHgjYONfRHuuQ2MyWCu6fwCJyhfnFvophYuYh"
                      }
                      alt=""
                      className="w-full h-40 sm:h-48 md:h-52 object-cover rounded"
                    />
                  </div>
                  <h1 className="text-black text-base sm:text-lg font-bold pt-2 sm:pt-3 break-words">
                    {title}
                  </h1>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 gap-2">
                    <p className="text-text text-xs sm:text-[14px]">
                      {doc?.lastEdited}
                    </p>
                    <div className="relative w-full sm:w-auto">
                      <button
                        className="text-black btn bg-white border-none shadow-none rounded-full hover:bg-gray-200 btn-primary w-full sm:w-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuIndex(
                            openMenuIndex === index ? null : index
                          );
                        }}
                        ref={(el) => (menuRefs.current[index] = el)}
                        aria-label="Open menu"
                      >
                        <CiMenuKebab size={22} />
                      </button>
                      {openMenuIndex === index && (
                        <div className="absolute right-0 top-10 z-20 w-32 sm:w-36 bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col animate-fade-in">
                          <button className="px-3 py-2 text-left hover:bg-blue-50 text-gray-700 rounded-t-lg text-xs sm:text-sm">
                            Edit
                          </button>
                          <button className="px-3 py-2 text-left hover:bg-blue-50 text-gray-700 text-xs sm:text-sm">
                            Delete
                          </button>
                          <button className="px-3 py-2 text-left hover:bg-blue-50 text-gray-700 rounded-b-lg text-xs sm:text-sm">
                            Share
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </section>
    </div>
  );
};

export default SharedDocument;
