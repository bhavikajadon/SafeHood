import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

let socket = null;

export function useSocket(city, onNewReport) {
  const callbackRef = useRef(onNewReport);
  callbackRef.current = onNewReport;

  useEffect(() => {
    if (!city) return;
    if (!socket) {
      socket = io({ path: "/socket.io" });
    }
    socket.emit("joinCity", city);
    socket.on("newReport", (data) => callbackRef.current?.(data));
    return () => socket.off("newReport");
  }, [city]);
}