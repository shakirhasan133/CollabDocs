import { useRef } from "react";
import { io } from "socket.io-client";
import UseAuth from "../../Hooks/UseAuth";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";

const NewDocuments = () => {
  const CreateNewDoc = useRef(null);
  const { user } = UseAuth();
  const navigate = useNavigate();

  const handleCreateNewDocument = (e) => {
    e.preventDefault();
    const form = e.target;
    const title = form.title.value;
    const description = form.description.value;
    const shareEmail = form.sharedEmail.value || "";

    const data = { title, description, shareEmail };
    // console.log(data);

    const socket = io(`${import.meta.env.VITE_Api_URL}/new-documents`, {
      withCredentials: true,
      transports: ["websocket"],
    });
    CreateNewDoc.current = socket;

    const NewDocument = () => {
      socket.emit("sendEmail", { email: user?.email || "" });

      socket.emit("sendNewDocData", data);

      socket.on("newDoc", (data) => {
        if (data.status === 200) {
          //---
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
            title: "Document Created Successfully",
          });
          //----
          form.reset();
          navigate(`/documents/${data.id}`);
        } else {
          //---
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
            title: "Something Went Wrong!",
          });
          //----
        }
      });
    };

    socket.on("connect", NewDocument);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-4 px-2 sm:px-4">
      <div className="w-full max-w-md sm:max-w-lg bg-white rounded-2xl shadow-2xl p-4 sm:p-8 flex flex-col items-center mx-auto">
        <div className="text-center mb-6 w-full">
          <h1 className="text-gray-800 font-extrabold text-xl sm:text-2xl mb-2">
            Create a New Document
          </h1>
          <p className="text-gray-500 text-sm sm:text-base md:text-lg">
            Start collaborating instantly
          </p>
        </div>
        <form
          className="w-full flex flex-col gap-4 sm:gap-5"
          onSubmit={handleCreateNewDocument}
        >
          <input
            type="text"
            name="title"
            required
            placeholder="Document Title"
            className="border placeholder:text-text text-black border-gray-300 px-3 py-2 sm:px-4 sm:py-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-sm sm:text-base"
          />
          <textarea
            name="description"
            placeholder="Description"
            required
            rows="4"
            className="w-full border placeholder:text-text text-black border-gray-300 px-3 py-2 sm:px-4 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition resize-none text-sm sm:text-base"
          ></textarea>
          <input
            type="text"
            placeholder="Share with Email (Optional)"
            name="sharedEmail"
            className="border placeholder:text-text text-black border-gray-300 px-3 py-2 sm:px-4 sm:py-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-sm sm:text-base"
          />
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 mt-2 w-full">
            <button
              type="button"
              className="px-4 py-2 sm:px-5 sm:py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition shadow-sm w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 sm:px-5 sm:py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-900 text-white font-bold shadow-md hover:from-blue-600 hover:to-purple-600 transition w-full sm:w-auto"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewDocuments;
