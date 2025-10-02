import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  secure: true, // siempre usar https
});

export default cloudinary;
