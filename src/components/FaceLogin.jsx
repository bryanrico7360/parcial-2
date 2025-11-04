"use client";
import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { useRouter } from "next/navigation";

export function FaceLogin() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const router = useRouter();

  // 🔹 Cargar modelos y activar cámara
  useEffect(() => {
    async function setup() {
      const MODEL_URL = "/models";

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setReady(true);
    }

    setup();

    return () => {
      const v = videoRef.current;
      if (v && v.srcObject) {
        v.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // 🔹 Detección continua de rostro
  useEffect(() => {
    if (!ready || !videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const displaySize = { width: 320, height: 240 };

    faceapi.matchDimensions(canvas, displaySize);

    const interval = setInterval(async () => {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (detection) {
        setFaceDetected(true);
        const resized = faceapi.resizeResults(detection, displaySize);

        // 🟢 Solo dibuja puntos del rostro (sin recuadro ni número)
        faceapi.draw.drawFaceLandmarks(canvas, resized);

        if (capturing) {
          setCapturing(false);

          // 🔹 Autenticación facial
          const faceEmbedding = Array.from(detection.descriptor);

          try {
            const res = await fetch("/api/auth/login-face", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ faceEmbedding }),
            });

            const data = await res.json();

            if (data.token) {
              localStorage.setItem("token", data.token);
              alert("✅ Rostro reconocido correctamente");
              router.push("/menu");
            } else {
              alert(data.error || "No se pudo autenticar el rostro");
            }
          } catch (err) {
            console.error("Error al autenticar:", err);
            alert("Error al procesar el inicio de sesión facial.");
          }
        }
      } else {
        setFaceDetected(false);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [ready, capturing, router]);

  // 🔹 Al presionar el botón
  const handleLogin = () => {
    setCapturing(true);
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative w-[320px] h-[240px] rounded-md overflow-hidden border border-gray-400">
        {/* 🎥 Cámara espejo */}
        <video
          ref={videoRef}
          width={320}
          height={240}
          muted
          autoPlay
          className="absolute top-0 left-0 object-cover transform scale-x-[-1]"
        />
        {/* 🟩 Canvas alineado con el video */}
        <canvas
          ref={canvasRef}
          width={320}
          height={240}
          className="absolute top-0 left-0 transform scale-x-[-1]"
        />
      </div>

      <p
        className={`text-sm ${
          faceDetected ? "text-green-600" : "text-gray-500"
        }`}
      >
        {faceDetected
          ? "Rostro detectado — listo para iniciar sesión"
          : "Alinea tu rostro frente a la cámara"}
      </p>

      <button
        onClick={handleLogin}
        disabled={!faceDetected}
        className={`px-4 py-1.5 rounded-md text-white font-medium transition ${
          faceDetected
            ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        Iniciar con rostro
      </button>
    </div>
  );
}
