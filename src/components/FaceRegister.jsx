"use client";
import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

export function FaceRegister({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadModels() {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setLoaded(true);
      startCamera();
    }
    loadModels();

    // cleanup
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const v = videoRef.current;
      if (v && v.srcObject) {
        v.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = videoRef.current;
      video.srcObject = stream;
      video.play();

      video.onloadedmetadata = () => {
        // Force a redraw inicial
        adjustCanvasSize();
        runDetectionLoop();
      };

      // También reajusta si la ventana cambia (responsive)
      window.addEventListener("resize", adjustCanvasSize);
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
    }
  };

  // Ajusta el canvas al tamaño *visible* del video (lo que se ve en pantalla)
  const adjustCanvasSize = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // getBoundingClientRect devuelve el tamaño CSS (visible) y la posición en la página
    const rect = video.getBoundingClientRect();
    // tamaño visible en píxeles en pantalla
    const displayWidth = Math.round(rect.width);
    const displayHeight = Math.round(rect.height);

    // Establece el tamaño del canvas en píxeles para coincidir con el video visible
    canvas.width = displayWidth;
    canvas.height = displayHeight;

    // Ajusta estilos también para que el canvas se muestre exactamente con esas dimensiones
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    // Indica a faceapi que use este tamaño para el resizeResults
    faceapi.matchDimensions(canvas, { width: displayWidth, height: displayHeight });
  };

  const runDetectionLoop = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Obtenemos el tamaño visible (por si cambió)
    const rect = video.getBoundingClientRect();
    const displaySize = { width: Math.round(rect.width), height: Math.round(rect.height) };

    // detectAllFaces espera el elemento <video> o imagen
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    const resized = faceapi.resizeResults(detections, displaySize);

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Opcional: dibujar una máscara semitransparente (si quieres)
    // ctx.fillStyle = "rgba(0,0,0,0.0)";
    // ctx.fillRect(0,0,canvas.width, canvas.height);

    // Dibujar recuadros y landmarks usando coordenadas ya redimensionadas
    faceapi.draw.drawDetections(canvas, resized);
    faceapi.draw.drawFaceLandmarks(canvas, resized);

    // siguiente frame
    rafRef.current = requestAnimationFrame(runDetectionLoop);
  };

  const handleCapture = async () => {
    const video = videoRef.current;
    if (!video) return;

    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      alert("No se detectó ningún rostro, intenta de nuevo.");
      return;
    }

    onCapture(Array.from(detection.descriptor));
  };

  return (
    <div className="flex flex-col items-center space-y-3 relative">
      <div
        className="relative rounded-md overflow-hidden"
        style={{ width: 320, height: 240 }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          // fijamos que el elemento ocupe 100% del contenedor para que getBoundingClientRect refleje eso
          style={{
            width: "100%",
            height: "100%",
            transform: "scaleX(-1)", // espejo
            objectFit: "cover", // puedes probar con "contain" si prefieres sin recorte
            display: "block",
          }}
        />

        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 rounded-md"
          style={{
            transform: "scaleX(-1)", // espejo
            pointerEvents: "none",
          }}
        />
      </div>

      <button
        type="button"
        onClick={() => {
          // Antes de capturar nos aseguramos que canvas esté ajustado al tamaño visible
          adjustCanvasSize();
          handleCapture();
        }}
        disabled={!loaded}
        className="bg-green-600 text-white px-3 py-1 rounded"
      >
        Capturar rostro
      </button>
    </div>
  );
}
