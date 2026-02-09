import React from "react";

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen grid place-items-center bg-background">
      {children}
    </div>
  );
}
