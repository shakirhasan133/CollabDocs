import { useEffect, useState, useRef } from "react";
// import defaultImg from "../../assets/doc.png";
import LoadingPage from "../../Pages/LoadingPage";
import { useNavigate } from "react-router";
import { io } from "socket.io-client";
import UseAuth from "./../../Hooks/UseAuth";
import Card from "../Shared/Card";
import Swal from "sweetalert2";

const MyFile = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = UseAuth();

  const myFileSocketRef = useRef(null);
  // const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Prevent connecting if no user yet
    if (!user?.email) return;

    const socket = io(`${import.meta.env.VITE_Api_URL}/my-documents`, {
      withCredentials: true,
      transports: ["websocket"],
      query: {
        email: user?.email,
      },
    });

    myFileSocketRef.current = socket;

    const handleConnect = () => {
      // console.log("Connected to socket:", socket.id);
      socket.emit("sendEmail", { email: user.email });

      socket.on("myDocuments", (data) => {
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

    // Cleanup function to avoid multiple sockets
    return () => {
      socket.disconnect();
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [user?.email, documents]);

  const handleNewDocument = () => {
    navigate("/new-document");
  };

  //

  const handleEdit = (id) => {
    navigate(`/documents/${id}`);
  };

  //   HandleDeleteButton
  const handleDeleteBtn = (id) => {
    const socket = io(`${import.meta.env.VITE_Api_URL}/deleteDocument`);
    socket.emit("sendDataForDelete", { email: user?.email, id: id });
    socket.on("DeleteResult", (data) => {
      // console.log(data);
      if (data.acknowledged === true) {
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });
        Toast.fire({
          icon: "success",
          title: "Document Deleted Successfully",
        });
      }
      if (data.status === "error") {
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });
        Toast.fire({
          icon: "error",
          title: "Something Went Wrong",
        });
      }
    });
  };

  //   Handle Share Button
  const handleShareButton = async (id) => {
    // console.log(id);
    const { value: email } = await Swal.fire({
      title: "Input email address",
      input: "email",
      inputLabel: "Your email address",
      inputPlaceholder: "Enter your email address",
      showCancelButton: true,
    });
    if (email) {
      const docId = id;
      // console.log(docId);

      const socket = io(`${import.meta.env.VITE_Api_URL}/share-with-others`, {
        query: { email: user.email || "email not found", id: docId },
      });
      socket.emit("getShareWithEmail", {
        email: user.email || "email not found",
        id: docId,
        shareEmail: email,
      });

      socket.on("shareResponse", (res) => {
        if (res.status === true) {
          Swal.fire(`Share Successful: ${email}`);
        }
        if (res.status === false) {
          Swal.fire("Something Went Wrong");
        }
      });

      //
    }
  };

  return (
    <div>
      <section className="container mx-auto px-2 sm:px-4 py-4 h-full min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h1 className="text-black text-2xl sm:text-3xl font-bold">
            My Documents
          </h1>
          <button className="btn w-full sm:w-auto" onClick={handleNewDocument}>
            Create New Documents
          </button>
        </div>

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
                <Card
                  doc={doc}
                  title={title}
                  key={index}
                  index={index}
                  handleEdit={handleEdit}
                  handleDeleteBtn={handleDeleteBtn}
                  handleShareButton={handleShareButton}
                ></Card>
              );
            })}
        </div>
      </section>
    </div>
  );
};

export default MyFile;
