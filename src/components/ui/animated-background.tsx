"use client";
import React from "react";

export const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 h-full w-full bg-black bg-[radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:24px_24px] -z-20">
      <div className="absolute inset-0 bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black)]"></div>
    </div>
  );
};
