import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import JoditEditor from "jodit-react";
import { FiEdit2 } from "react-icons/fi";
import io from "socket.io-client";
import UseAuth from "../../Hooks/UseAuth";
import { debounce } from "lodash";

const DocumentDetails = () => {
  const { id } = useParams();
  const editor = useRef(null);
  const { user } = UseAuth();
  const [content, setContent] = useState("");
  const [editable, setEditable] = useState(false);
  const [title, setTitle] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const roomSocketRef = useRef(null);
  let shakirSocket = useRef(null);
  const currentContentRef = useRef("");

  // Track online users in the document room
  useEffect(() => {
    if (!user || !id) {
      return;
    }
    roomSocketRef.current = io(`${import.meta.env.VITE_Api_URL}/document-room`);
    roomSocketRef.current.on("connect", () => {
      roomSocketRef.current.emit("join-document", {
        name: user?.displayName,
        photo: user?.photoURL,
        email: user?.email,
        docID: id,
      });
    });

    roomSocketRef.current.on("GetOnlineUser", (data) => {
      setOnlineUsers(data);
    });
    return () => {
      roomSocketRef.current.disconnect();
    };
  }, [user]);

  // console.log(onlineUsers);

  // UpdateCode
  useEffect(() => {
    if (!user) return;
    const socket = io(`${import.meta.env.VITE_Api_URL}/document-details-page`);
    shakirSocket.current = socket;

    socket.emit("sendDetailsData", { email: user?.email, id: id });
    const handleDetails = (data) => {
      // console.log(data);
      if (data.details !== currentContentRef.current) {
        setContent(data.details);
        currentContentRef.current = data.details;
      }
      if (!editable) {
        setTitle(data.title);
      }
    };

    socket.on("getDocumentDetails", handleDetails);

    return () => {
      socket.off("getDocumentDetails", handleDetails);
      socket.disconnect();
    };
  }, [user, id]);

  const handleNewDataSubmit = (details, newTitle) => {
    if (currentContentRef.current === details) return;
    currentContentRef.current = details;
    const data = { email: user?.email, id, title: newTitle, details };
    shakirSocket.current.emit("UpdateNewDocument", data);
  };

  const handleEditableToggle = () => {
    handleNewDataSubmit(content?.details, title);
    setEditable((prev) => !prev);
  };

  const debouncedSubmit = useRef(
    debounce((details, title) => {
      handleNewDataSubmit(details, title);
    }, 400) // 400ms delay
  ).current;

  return (
    <div className="min-h-screen bg-gray-100 py-2 px-2 ">
      <div className="w-full container mx-auto py-5 bg-white rounded-2xl shadow-2xl sm:p-10 flex flex-col gap-6">
        <div className="flex justify-between items-center flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <div>
            {editable ? (
              <input
                className="text-2xl font-bold text-gray-900 border-b-2 border-blue-400 bg-blue-50 px-2 py-1 rounded focus:outline-none sm:w-auto"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
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
                className={`w-8 h-8 rounded-full cursor-pointer bg-blue-500 text-white flex items-center justify-center text-xs font-bold`}
                title={user?.UserName ? user?.UserName : user?.userEmail}
              >
                {(user?.UserPhoto && (
                  <img src={user?.UserPhoto} alt="" className="rounded-full" />
                )) ||
                  (user?.UserName && user?.UserName[0].toUpperCase()) ||
                  "User"}
              </div>
            ))}
          </div>
        </div>

        <div className="w-full min-h-[80vh]">
          <JoditEditor
            ref={editor}
            value={content}
            tabIndex={1}
            config={{
              placeholder: "",
              editorClassName: "text-black py-5",
            }}
            onChange={(newContent) => debouncedSubmit(newContent, title)}
            className="rounded-lg border border-gray-200 shadow-sm text-text min-h-[80vh]"
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentDetails;
