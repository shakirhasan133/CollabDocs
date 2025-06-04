import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import JoditEditor from "jodit-react";
import { FiEdit2 } from "react-icons/fi";
import io from "socket.io-client";
import UseAuth from "../../Hooks/UseAuth";

const DocumentDetails = () => {
  const { id } = useParams();
  const editor = useRef(null);
  const { user } = UseAuth();

  const [content, setContent] = useState({});
  const [editable, setEditable] = useState(false);
  const [title, setTitle] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);

  const detailsSocketRef = useRef(null);
  const roomSocketRef = useRef(null);
  const updateSocketRef = useRef(null);

  // Fetch and update document details
  useEffect(() => {
    if (!id || !user) return;

    detailsSocketRef.current = io(
      `${import.meta.env.VITE_Api_URL}/document-details`,
      {
        query: { email: user.email },
      }
    );

    const socket = detailsSocketRef.current;

    socket.emit("sendDetailsData", { email: user.email, id });

    const handleGetDetails = (data) => {
      setContent(data);
      if (!editable) setTitle(data.title);
    };

    socket.on("getDocumentDetails", handleGetDetails);
    socket.on("disconnect", () => console.log("Details socket disconnected"));

    return () => {
      socket.off("getDocumentDetails", handleGetDetails);
      socket.disconnect();
      detailsSocketRef.current = null;
    };
  }, [id, user, user?.email, editable]);

  // Track online users in the document room

  useEffect(() => {
    if (!user) {
      return;
    }

    roomSocketRef.current = io(`${import.meta.env.VITE_Api_URL}/document-room`);
    roomSocketRef.current.on("connect", () => {
      roomSocketRef.current.emit("join-document", {
        name: user?.displayName,
        photo: user?.photoURL,
        email: user?.email,
      });
    });

    roomSocketRef.current.on("GetOnlineUser", (data) => {
      setOnlineUsers(data);
    });
    return () => {};
  }, [user]);

  // Socket to emit updates
  useEffect(() => {
    updateSocketRef.current = io(
      `${import.meta.env.VITE_Api_URL}/document-details-update`
    );
    return () => {
      updateSocketRef.current?.disconnect();
      updateSocketRef.current = null;
    };
  }, []);

  const handleNewDataSubmit = (details, newTitle) => {
    const data = { email: user?.email, id, title: newTitle, details };
    updateSocketRef.current?.emit("UpdateDetails", data);
  };

  const handleEditableToggle = () => {
    handleNewDataSubmit(content.details, title);
    setEditable((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-2 px-2">
      <div className="w-full container mx-auto py-5 bg-white rounded-2xl shadow-2xl sm:p-10 flex flex-col gap-6">
        <div className="flex justify-between items-center flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <div>
            <label className="text-lg font-semibold text-gray-700 min-w-[60px]">
              Title:
            </label>
            {editable ? (
              <input
                className="text-2xl font-bold text-gray-900 border-b-2 border-blue-400 bg-blue-50 px-2 py-1 rounded focus:outline-none w-full sm:w-auto"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleEditableToggle}
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 break-all">
                  {title}
                </h1>
                <button
                  className="ml-1 text-blue-500 hover:text-blue-700 p-1 rounded-full"
                  onClick={handleEditableToggle}
                  aria-label="Edit title"
                >
                  <FiEdit2 size={20} />
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-2 items-center">
            {onlineUsers.map((user, index) => (
              <div
                key={index}
                className="w-8 h-8 rounded-full cursor-pointer bg-blue-500 text-white flex items-center justify-center text-xs font-bold"
                title={user?.name}
              >
                {/* {user.name[0]?.toUpperCase()} */}
                <img
                  src={user?.UserPhoto}
                  alt=""
                  srcset=""
                  className="rounded-full"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="w-full min-h-[60vh]">
          <JoditEditor
            ref={editor}
            value={content.details}
            tabIndex={1}
            placeholder="Start typing..."
            onBlur={(newContent) => handleNewDataSubmit(newContent, title)}
            className="rounded-lg border border-gray-200 shadow-sm text-text min-h-[100vh]"
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentDetails;
