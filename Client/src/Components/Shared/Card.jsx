import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { CiMenuKebab } from "react-icons/ci";
import { useLocation, useNavigate } from "react-router";
import Swal from "sweetalert2";

const Card = ({
  doc,
  title,
  index,
  handleShareButton,
  handleDeleteBtn,
  handleEdit,
}) => {
  const navigate = useNavigate();
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const menuRefs = useRef([]);
  const location = useLocation();
  const [isSharedPage, setIsSharedPage] = useState(false);

  useEffect(() => {
    if (location.pathname.endsWith("/shared")) {
      setIsSharedPage(true);
    } else {
      setIsSharedPage(false);
    }
  }, [location.pathname]);

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
    <div className="relative p-2 sm:p-3 border-2 rounded-md hover:border hover:border-primary transition-all delay-75  bg-white shadow-sm flex flex-col">
      <div
        className="w-full rounded overflow-hidden cursor-pointer hover:scale-105 transition-all "
        onClick={() => navigate(`/documents/${doc._id}`)}
      >
        <img
          src={
            doc?.thumbnailUrl
              ? doc?.thumbnailUrl
              : "https://lh3.googleusercontent.com/aida-public/AB6AXuBQN3JCRNBXOSYVY55dHhH71UiupwzTEk1pNgYXBVWNFIWjdpZ2v7z8mxJxXouzx31CqcvTzkhrimECXilTGCvS3nzTZtnVvQsS2TvZLJU3-qDTExCVur_MP5ymO2sehOJJ0vJ9s61OC4mNYR4Y4xGzBRo6sEI2-KBCLtKHne6lWXQHLHY2RlUU9cLdMvtMiDcFoFWKrlDqssxgF4C8n_OHmBJGzChpk4NgWE-07arKHgjYONfRHuuQ2MyWCu6fwCJyhfnFvophYuYh"
          }
          alt=""
          className="w-full h-40 sm:h-48 md:h-52 object-cover  rounded "
        />
      </div>
      <h1 className="text-black text-base sm:text-lg font-bold pt-2 sm:pt-3 break-words">
        {title}
      </h1>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 gap-2">
        <p className="text-text text-xs sm:text-[14px]">
          {doc?.lastEdited ? moment(doc.lastEdited).fromNow() : "No Changes..."}
        </p>
        <div className="relative w-full sm:w-auto">
          <button
            className="text-black btn bg-white border-none shadow-none rounded-full hover:bg-gray-200 btn-primary w-full sm:w-auto"
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenuIndex(openMenuIndex === index ? null : index);
            }}
            ref={(el) => (menuRefs.current[index] = el)}
            aria-label="Open menu"
          >
            <CiMenuKebab size={22} />
          </button>
          {openMenuIndex === index && (
            <div
              className="absolute right-0 top-10 z-20 w-32 sm:w-36 bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col animate-fade-in"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  handleEdit(doc._id);
                }}
                className="px-3 cursor-pointer py-2 text-left hover:bg-blue-50 text-gray-700 rounded-t-lg text-xs sm:text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  Swal.fire({
                    title: "Are you sure?",
                    text: "You won't be able to revert this!",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Yes, delete it!",
                  }).then((result) => {
                    if (result.isConfirmed) {
                      handleDeleteBtn(doc?._id);
                    }
                  });
                }}
                className="px-3 py-2 text-left cursor-pointer hover:bg-blue-50 text-gray-700 text-xs sm:text-sm"
              >
                Delete
              </button>
              {!isSharedPage && (
                <button
                  onClick={() => {
                    handleShareButton(doc?._id);
                  }}
                  className={`px-3 py-2 text-left cursor-pointer hover:bg-blue-50 text-gray-700 rounded-b-lg text-xs sm:text-sm`}
                >
                  Share
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
