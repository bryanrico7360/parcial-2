"use client";
import { useEffect, useRef, useState } from "react";

export default function RegistrarProductoPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    precio: "",
    descripcion: "",
    stock: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");

  // cámara
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);

  const isFormValid =
    formData.nombre.trim() !== "" &&
    formData.precio !== "" &&
    parseFloat(formData.precio) >= 0 &&
    formData.descripcion.trim() !== "" &&
    formData.stock !== "" &&
    parseInt(formData.stock) >= 0 &&
    (file !== null || photo !== null);

  useEffect(() => {
    if (!isCameraOn) return;
    const iniciarCamara = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Error al acceder a la cámara:", err);
      }
    };
    iniciarCamara();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((t) => t.stop());
      }
    };
  }, [isCameraOn]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if ((name === "precio" || name === "stock") && value < 0) value = 0;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const f = e.target.files[0];
      setFile(f);
      setPreview(URL.createObjectURL(f));
    } else {
      setFile(null);
      setPreview(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
  };

const tomarFoto = () => {
  if (!videoRef.current || !canvasRef.current) return;

  const video = videoRef.current;
  const canvas = canvasRef.current;
  const context = canvas.getContext("2d");

  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;

  // 🔹 Calculamos un recorte cuadrado centrado
  const size = Math.min(videoWidth, videoHeight);
  const offsetX = (videoWidth - size) / 2;
  const offsetY = (videoHeight - size) / 2;

  canvas.width = size;
  canvas.height = size;

  // 🔹 Dibuja la imagen espejada y recortada
  context.save();
  context.scale(-1, 1);
  context.drawImage(
    video,
    offsetX,
    offsetY,
    size,
    size,
    -size,
    0,
    size,
    size
  );
  context.restore();

  const imageData = canvas.toDataURL("image/png", 0.9);
  setPhoto(imageData);
  setPreview(imageData);
  setIsCameraOn(false);

  // 🔹 Apagamos la cámara para liberar recursos
  const stream = video.srcObject;
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!isFormValid) return;

    const data = new FormData();
    data.append("nombre", formData.nombre);
    data.append("precio", formData.precio);
    data.append("descripcion", formData.descripcion);
    data.append("stock", formData.stock);

    if (file) data.append("foto", file);
    else if (photo) {
      const blob = await (await fetch(photo)).blob();
      data.append("foto", blob, "captura.png");
    }

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      if (res.ok) {
        setMessage("✅ Producto registrado correctamente");
        setFormData({ nombre: "", precio: "", descripcion: "", stock: "" });
        setFile(null);
        setPreview(null);
        setPhoto(null);
      } else {
        setMessage(result.error || "❌ Error al registrar");
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      setMessage("❌ Error al conectar con el servidor");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow w-96 space-y-4"
      >
        <h1 className="text-2xl font-bold text-black text-center">
          Registrar Producto
        </h1>

        {message && <p className="text-center text-blue-600">{message}</p>}

        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={formData.nombre}
          onChange={handleChange}
          className="border text-black p-2 w-full rounded"
          required
        />

        <input
          type="number"
          name="precio"
          placeholder="Precio"
          value={formData.precio}
          onChange={handleChange}
          className="border text-black p-2 w-full rounded"
          min="0"
          required
        />

        <textarea
          name="descripcion"
          placeholder="Descripción"
          value={formData.descripcion}
          onChange={handleChange}
          className="border text-black p-2 w-full rounded"
          required
        />

        <input
          type="number"
          name="stock"
          placeholder="Cantidad en stock"
          value={formData.stock}
          onChange={handleChange}
          className="border text-black p-2 w-full rounded"
          min="0"
          required
        />

        {/* Sección de imagen */}
        <div className="border-2 border-dashed p-4 rounded text-center text-gray-500">
          {preview ? (
            <div className="flex flex-col items-center space-y-2">
              <img
                src={preview}
                alt="preview"
                className="mt-2 w-32 h-32 object-cover rounded"
              />
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-red-500 text-sm hover:underline cursor-pointer"
              >
                Quitar imagen
              </button>
            </div>
          ) : isCameraOn ? (
            <div>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-48 bg-black rounded mb-2"
                style={{ transform: "scaleX(-1)" }} 
              />
              <button
                type="button"
                onClick={tomarFoto}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Tomar foto
              </button>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          ) : (
            <>
              <p>📸 No hay imagen seleccionada</p>
              <label
                htmlFor="fileInput"
                className="cursor-pointer text-blue-600 block mt-2"
              >
                Seleccionar archivo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="fileInput"
              />
              <p
                className="cursor-pointer text-green-600 mt-2 hover:underline"
                onClick={() => setIsCameraOn(true)}
              >
                Usar cámara
              </p>
            </>
          )}
        </div>

        <button
          type="submit"
          disabled={!isFormValid}
          className={`w-full text-white py-2 rounded ${
            isFormValid
              ? "bg-blue-600 hover:bg-blue-700 transform hover:scale-105 transition-transform cursor-pointer"
              : "bg-blue-600/50 cursor-not-allowed"
          }`}
        >
          Registrar Producto
        </button>
      </form>
    </main>
  );
}
