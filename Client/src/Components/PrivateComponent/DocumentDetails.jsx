import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import JoditEditor from "jodit-react";
import { FiEdit2 } from "react-icons/fi";
import io from "socket.io-client";
import UseAuth from "../../Hooks/UseAuth";

const DocumentDetails = () => {
  const { id } = useParams();
  const editor = useRef(null);
  const [content, setContent] = useState({});
  const [editable, setEditable] = useState(false);
  const [title, setTitle] = useState("");
  const [newDetails, setNewDetails] = useState("");
  const { user } = UseAuth();

  // Only use id from params, do not fallback

  useEffect(() => {
    if (!id || !user) return;

    const socket = io(`${import.meta.env.VITE_Api_URL}/document-details`, {
      query: {
        email: user.email,
      },
    });
    socket.emit("sendDetailsData", { email: user.email, id });

    socket.on("getDocumentDetails", (data) => {
      // console.log(data);
      setContent(data);
      setTitle(data.title);
    });

    const handleDisconnect = () => {
      console.log("Disconnected");
    };
    socket.on("disconnect", handleDisconnect);

    // Cleanup function to avoid multiple sockets
    return () => {
      socket.disconnect();
      socket.off("disconnect", handleDisconnect);
    };
  }, [id, user, content]);

  const updateDataSocketRef = useRef(null);

  useEffect(() => {
    updateDataSocketRef.current = io(
      `${import.meta.env.VITE_Api_URL}/document-details-update`
    );
    return () => {
      if (updateDataSocketRef.current) {
        updateDataSocketRef.current.disconnect();
      }
    };
  }, []);

  const handleNewDataSubmit = (details) => {
    const data = { email: user?.email, id: id, title: title, details: details };
    updateDataSocketRef.current?.emit("UpdateDetails", data);
  };

  const handleEditable = () => {
    setEditable((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-2 px-2">
      <div className="w-full container mx-auto py-5 bg-white rounded-2xl shadow-2xl  sm:p-10 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <label className="text-lg font-semibold text-gray-700 min-w-[60px]">
            Title:
          </label>
          {editable ? (
            <input
              className="text-2xl font-bold text-gray-900 border-b-2 border-blue-400 bg-blue-50 px-2 py-1 rounded focus:outline-none w-full sm:w-auto"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleEditable}
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 break-all">
                {title}
              </h1>
              <button
                className="ml-1 text-blue-500 hover:text-blue-700 p-1 rounded-full"
                onClick={handleEditable}
                aria-label="Edit title"
              >
                <FiEdit2 size={20} />
              </button>
            </div>
          )}
        </div>
        <div className="w-full min-h-[60vh]">
          <JoditEditor
            ref={editor}
            value={content.details}
            tabIndex={1}
            placeholder=""
            // onChange={setContent}
            onBlur={(newContent) => handleNewDataSubmit(newContent)}
            className="rounded-lg border border-gray-200 shadow-sm text-text"
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentDetails;
