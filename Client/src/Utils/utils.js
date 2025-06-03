import axios from "axios";

export const imageUpload = async (ImageInfo) => {
  const formdata = new FormData();
  formdata.append("image", ImageInfo);

  const { data } = await axios.post(
    `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
    formdata
  );
  return data.data.display_url;
};

export const SaveUser = async (userData) => {
  try {
    await axios.post(
      `${import.meta.env.VITE_Api_URL}/users/${userData?.email}`,
      {
        name: userData?.displayName,
        image: userData?.photoURL,
        email: userData?.email,
        activeStatus: true,
      }
    );
  } catch (error) {
    console.log(error.message);
  }
};
