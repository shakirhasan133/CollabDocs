import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import JoditEditor from "jodit-react";
import { FiEdit2 } from "react-icons/fi";
import io from "socket.io-client";

const DocumentDetails = () => {
  const { id } = useParams();
  const editor = useRef(null);
  const [content, setContent] = useState("");
  const [editable, setEditable] = useState(false);
  const [fetchData, setFetchData] = useState([]);
  const [title, setTitle] = useState("");

  const socketRef = useRef(null);

  // console.log(content);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!socketRef.current || !socketRef.current.connected) {
        socketRef.current = io(`${import.meta.env.VITE_Api_URL}`);
        socketRef.current.on("connected", () => {
          console.log(
            "Socket.IO সার্ভারের সাথে কানে���্টেড:",
            socketRef.current.id
          );
        });
        socketRef.on("disconnected", () => {
          console.log("Disconected");
        });
      }
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const res = await fetch("/file.json");
      const data = await res.json();
      const result = data?.find((doc) => doc.id === id);
      setFetchData(result);
      setTitle(result.title);
    };
    loadData();
  }, [id]);

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
            value={fetchData?.details || content}
            tabIndex={1}
            // onChange={setContent}
            onBlur={(newContent) => setContent(newContent)}
            className="rounded-lg border border-gray-200 shadow-sm text-text"
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentDetails;
