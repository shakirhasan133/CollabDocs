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
