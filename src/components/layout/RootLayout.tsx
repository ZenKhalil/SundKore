import React from "react";
import { Outlet } from "react-router-dom";

export const RootLayout: React.FC = () => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Fonts would be imported in your CSS or index.html */}
      </head>
      <body>
        <Outlet />
      </body>
    </html>
  );
};
