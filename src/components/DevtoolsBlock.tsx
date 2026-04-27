"use client";

import { useEffect } from "react";

export default function DevtoolsBlock() {
  useEffect(() => {
    const onContext = (e: MouseEvent) => e.preventDefault();

    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", onContext);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return null;
}
