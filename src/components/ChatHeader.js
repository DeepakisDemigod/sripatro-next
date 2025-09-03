"use client";
import { VideoCamera } from "phosphor-react";

export default function ChatHeader({ name, email, avatarUrl, videoUrl }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-base-200">
      <div className="flex items-center gap-3">
        <img
          src={avatarUrl}
          alt={name}
          className="w-12 h-12 rounded-full border border-base-300 shadow-sm"
        />
        <div className="flex flex-col">
          <span className="font-bold text-lg text-base-content/90">{name}</span>
          <span className="text-xs text-base-content/60">{email}</span>
        </div>
      </div>
      <a
        href={videoUrl}
        className="btn btn-success flex items-center gap-2 text-white text-base rounded-xl px-4 py-2 shadow-md"
        target="_blank"
        rel="noopener noreferrer"
      >
        <VideoCamera size={22} weight="bold" />
        Video Call
      </a>
    </div>
  );
}
