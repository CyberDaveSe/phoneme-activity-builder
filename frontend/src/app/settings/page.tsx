"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const cookies = document.cookie.split("; ");

    const themeCookie = cookies.find((cookie) =>
      cookie.startsWith("theme=")
    );

    const savedTheme = themeCookie?.split("=")[1];

    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    }
  }, []);

  const changeTheme = (newTheme: "light" | "dark") => {
    setTheme(newTheme);

    document.documentElement.setAttribute(
      "data-theme",
      newTheme
    );

    document.cookie =
      `theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
  };

  return (
    <main className="pageContainer">
      <h1>Settings</h1>

      <section>
        <h2>Appearance</h2>

        <p>
          Choose the colour theme used throughout the activity builder.
        </p>

        <label>
          <input
            type="radio"
            name="theme"
            value="light"
            checked={theme === "light"}
            onChange={() => changeTheme("light")}
          />
          Light mode
        </label>

        <label>
          <input
            type="radio"
            name="theme"
            value="dark"
            checked={theme === "dark"}
            onChange={() => changeTheme("dark")}
          />
          Dark mode
        </label>
      </section>
    </main>
  );
}