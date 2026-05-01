"use client";

import { useEffect } from "react";

export default function SecurityGuard() {
  useEffect(() => {
    // Solo aplicar si NO estamos en localhost
    const isLocalhost = 
      window.location.hostname === "localhost" || 
      window.location.hostname === "127.0.0.1";

    if (isLocalhost) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Bloquear F12
      if (e.key === "F12") {
        e.preventDefault();
        return false;
      }

      // Bloquear Ctrl+Shift+I (Inspect)
      // Bloquear Ctrl+Shift+J (Console)
      // Bloquear Ctrl+Shift+C (Inspect Element)
      // Bloquear Ctrl+U (View Source)
      // Bloquear Ctrl+F (Find)
      if (e.ctrlKey && (e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C") || e.key === "u" || e.key === "f")) {
        e.preventDefault();
        return false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Bloqueo de atajos de teclado
    window.addEventListener("keydown", handleKeyDown);
    // Bloqueo de click derecho
    window.addEventListener("contextmenu", handleContextMenu);

    // Truco para dificultar el uso de la consola si se abre
    const clearConsole = setInterval(() => {
      console.clear();
      // Opcional: Mensaje de advertencia
      console.log("%c¡Alto!", "color: red; font-size: 40px; font-weight: bold;");
      console.log("%cEl acceso a la consola está restringido en este entorno.", "font-size: 18px;");
    }, 1000);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("contextmenu", handleContextMenu);
      clearInterval(clearConsole);
    };
  }, []);

  return null;
}
