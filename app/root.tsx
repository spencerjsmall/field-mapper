import type { MetaFunction, LinksFunction } from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import styles from "./styles/app.css";
import { TbCompassOff } from "react-icons/tb";
import { ErrorMessage } from "./components/error-message";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Field Mapper",
  viewport: "width=device-width,initial-scale=1",
});

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap",
    },
  ];
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }) {
  console.error(error);
  return (
    <html>
      <head>
        <title>Application Error</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="min-safe-h-screen w-screen bg-black flex flex-col items-center justify-center">
          <ErrorMessage />
        </div>
        <Scripts />
      </body>
    </html>
  );
}
