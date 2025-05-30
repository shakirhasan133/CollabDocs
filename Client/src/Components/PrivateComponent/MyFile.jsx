import { useEffect, useState } from "react";
import defaultImg from "../../assets/doc.png";
import LoadingPage from "../../Pages/LoadingPage";

const MyFile = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <section className="container mx-auto py-5 h-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-black text-3xl font bold">My Documents</h1>
          <button className="btn">Create New Documents</button>
        </div>

        {/* Content */}

        {loading && <LoadingPage></LoadingPage>}

        <div className="grid grid-cols-5 my-5 gap-3">
          {Array.isArray(documents) &&
            documents.map((doc) => {
              const title =
                doc.title.length > 25
                  ? doc.title.slice(0, 25) + "..."
                  : doc.title;
              return (
                <div className="p-3 border-2 rounded-md ">
                  <div className="w-full rounded">
                    <img
                      src={doc?.thumbnailUrl ? doc?.thumbnailUrl : defaultImg}
                      alt=""
                      className="w-full h-[200px]"
                    />
                  </div>
                  <h1 className="text-black text font-bold pt-3">{title}</h1>
                  <p className="text-text">{doc?.lastEdited}</p>
                </div>
              );
            })}
        </div>
      </section>
    </div>
  );
};

export default MyFile;
