import { useEffect, useState, useRef } from "react";
// import defaultImg from "../../assets/doc.png";
import LoadingPage from "../../Pages/LoadingPage";
import { useNavigate } from "react-router";
import UseAuth from "../../Hooks/UseAuth";
import { io } from "socket.io-client";
import Card from "../Shared/Card";

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
                <Card doc={doc} title={title} key={index} index={index}></Card>
              );
            })}
        </div>
      </section>
    </div>
  );
};

export default SharedDocument;
