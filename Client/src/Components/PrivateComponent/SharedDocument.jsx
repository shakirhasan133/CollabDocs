import { useEffect, useState, useRef } from "react";
import defaultImg from "../../assets/doc.png";
import LoadingPage from "../../Pages/LoadingPage";
import { useNavigate } from "react-router";
import { CiMenuKebab } from "react-icons/ci";

const SharedDocument = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const menuRefs = useRef([]);
  const navigate = useNavigate();

  console.log(documents);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/file.json");
      const data = await res.json();
      setDocuments(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleNewDocument = () => {
    navigate("/dashboard/new-document");
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
      <section className="container mx-auto py-5 h-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-black text-3xl font bold">My Documents</h1>
          <button className="btn" onClick={handleNewDocument}>
            Create New Documents
          </button>
        </div>

        {/* Content */}

        {loading && <LoadingPage></LoadingPage>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 my-5 gap-3">
          {Array.isArray(documents) &&
            documents.map((doc, index) => {
              const title =
                doc.title.length > 25
                  ? doc.title.slice(0, 25) + "..."
                  : doc.title;
              return (
                <div
                  className="relative p-3 border-2 rounded-md hover:border hover:border-primary transition-all delay-75 cursor-pointer bg-white shadow-sm"
                  key={index}
                >
                  <div className="w-full rounded">
                    <img
                      src={doc?.thumbnailUrl ? doc?.thumbnailUrl : defaultImg}
                      alt=""
                      className="w-full h-[200px] object-cover rounded"
                    />
                  </div>
                  <h1 className="text-black text font-bold pt-3">{title}</h1>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-text text-[14px]">{doc?.lastEdited}</p>
                    <div className="relative">
                      <button
                        className="text-black btn bg-white border-none shadow-none rounded-full hover:bg-gray-200 btn-primary"
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
                        <div className="absolute right-0 top-8 z-20 w-36 bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col animate-fade-in">
                          <button className="px-4 py-2 text-left hover:bg-blue-50 text-gray-700 rounded-t-lg">
                            Edit
                          </button>
                          <button className="px-4 py-2 text-left hover:bg-blue-50 text-gray-700">
                            Delete
                          </button>
                          <button className="px-4 py-2 text-left hover:bg-blue-50 text-gray-700 rounded-b-lg">
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
