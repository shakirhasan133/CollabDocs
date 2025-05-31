import React from "react";

const ActiveUser = () => {
  return (
    <div className="container mx-auto min-h-screen">
      <section className=" py-5">
        <h1 className="text-3xl text-text font-bold py-5">Active Users</h1>

        <div className="flex overflow-hidden rounded-lg border border-[#cfd8e7] bg-[#f8f9fc]">
          <table className="flex-1">
            <thead>
              <tr className="bg-[#f8f9fc]">
                <th className=" px-4 py-3 text-left text-[#0d131b] w-14 text-sm font-medium leading-normal">
                  Photo
                </th>
                <th className="px-4 py-3 text-left text-[#0d131b] w-[400px] text-sm font-medium leading-normal">
                  User
                </th>
                <th className=" px-4 py-3 text-left text-[#0d131b] w-[400px] text-sm font-medium leading-normal">
                  Email
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-t-[#cfd8e7]">
                <td class=" h-[72px] px-4 py-2 w-14 text-sm">
                  <div className="rounded-full w-10">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDz5-StoPbK4UtgFuTPDQSSgVUOkemHf9f8qJMU0s1l6bYPm9nDrfE1oPD6A2nG1Vg2sVCWn73fVVAowOhTvUZbfj-1I8cJLStoaVFOeKh3TMjVeas2oZLpXUWUGuGOD8MNlBRK587F7HA4gAGMLo6yizcDtaUL5Rv5uqCc1qLlvWYkrellXcRgqMIJAIxJInMWw1HOAjCOQIOzWKJxU2KYkq3Mzc4ueUTa3opqZ4zTFNEPh-jNHIwqR7bqewPUXMHCk2xKE_glBf4e"
                      alt=""
                      className="rounded-full"
                    />
                  </div>
                </td>
                <td className=" h-[72px] px-4 py-2 w-[400px] text-[#0d131b] text-sm font-normal leading-normal">
                  Sophia Carter
                </td>
                <td className=" h-[72px] px-4 py-2 w-[400px] text-[#4c6a9a] text-sm font-normal leading-normal">
                  sophia.carter@email.com
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default ActiveUser;
