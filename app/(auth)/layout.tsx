import React from "react";

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen grid place-items-center bg-background p-4">
      {children}
    </div>
  );
}
