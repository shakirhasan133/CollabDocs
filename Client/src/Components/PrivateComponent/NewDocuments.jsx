const NewDocuments = () => {
  return (
    <div className="min-h-screen  flex items-center justify-center py-2 px-2">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-gray-800 font-extrabold text-2xl md:text-2xl mb-2">
            Create a New Document
          </h1>
          <p className="text-gray-500 text-base md:text-lg">
            Start collaborating instantly
          </p>
        </div>
        <form className="w-full flex flex-col gap-5">
          <input
            type="text"
            placeholder="Document Title"
            className="border placeholder:text-text text-black border-gray-300 px-4 py-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
          <textarea
            name="description"
            placeholder="Description"
            rows="4"
            className="w-full border placeholder:text-text text-black border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition resize-none"
          ></textarea>
          <input
            type="text"
            placeholder="Share with Email (Optional)"
            className="border placeholder:text-text text-black border-gray-300 px-4 py-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
          <div className="flex items-center justify-end gap-3 mt-2">
            <button
              type="button"
              className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-900 text-white font-bold shadow-md hover:from-blue-600 hover:to-purple-600 transition"
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
