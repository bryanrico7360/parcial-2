"use client";
import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { useRouter } from "next/navigation";

export function FaceLogin() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

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
        adjustCanvasSize();
        runDetectionLoop();
      };
      window.addEventListener("resize", adjustCanvasSize);
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
    }
  };

  const adjustCanvasSize = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const rect = video.getBoundingClientRect();
    const displayWidth = Math.round(rect.width);
    const displayHeight = Math.round(rect.height);
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    faceapi.matchDimensions(canvas, { width: displayWidth, height: displayHeight });
  };

  const runDetectionLoop = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const rect = video.getBoundingClientRect();
    const displaySize = { width: rect.width, height: rect.height };

    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    const resized = faceapi.resizeResults(detections, displaySize);

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resized);
    faceapi.draw.drawFaceLandmarks(canvas, resized);

    rafRef.current = requestAnimationFrame(runDetectionLoop);
  };

  const handleLogin = async () => {
    const video = videoRef.current;
    if (!video) return;

    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      alert("No se detectó ningún rostro. Intenta de nuevo.");
      return;
    }

    // Enviar el descriptor al backend
    const faceDescriptor = Array.from(detection.descriptor);

    try {
      const res = await fetch("/api/login-face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faceDescriptor }),
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ Login exitoso");
        router.push("/dashboard"); // redirige a donde quieras
      } else {
        alert("❌ Rostro no reconocido.");
      }
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
    }
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
          style={{
            width: "100%",
            height: "100%",
            transform: "scaleX(-1)",
            objectFit: "cover",
            display: "block",
          }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0"
          style={{
            transform: "scaleX(-1)",
            pointerEvents: "none",
          }}
        />
      </div>

      <button
        type="button"
        onClick={handleLogin}
        disabled={!loaded}
        className="bg-blue-600 text-white px-3 py-1 rounded"
      >
        Iniciar sesión con rostro
      </button>
    </div>
  );
}
