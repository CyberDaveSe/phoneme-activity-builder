"use client";

import { useEffect } from "react";

export default function ThemeLoader() {
  useEffect(() => {
    const cookies = document.cookie.split("; ");

    const themeCookie = cookies.find((cookie) =>
      cookie.startsWith("theme=")
    );

    const theme = themeCookie?.split("=")[1] ?? "light";

    document.documentElement.setAttribute("data-theme", theme);
  }, []);

  return null;
}