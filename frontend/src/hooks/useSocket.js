import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

let socket = null;

export function useSocket(city, onNewReport) {
  const callbackRef = useRef(onNewReport);
  callbackRef.current = onNewReport;

  useEffect(() => {
    if (!city) return;
    if (!socket) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL || undefined;
      socket = io(socketUrl, { path: "/socket.io", transports: ["websocket", "polling"] });
    }
    socket.emit("joinCity", city);
    const handleNewReport = (data) => callbackRef.current?.(data);
    socket.on("newReport", handleNewReport);
    return () => socket?.off("newReport", handleNewReport);
  }, [city]);
}