"use client";

import React from "react";
import { MessageSquare } from "lucide-react";

export const WhatsAppButton: React.FC = () => {
  const whatsappUrl = "https://wa.me/919118066449?text=Hello%20Fyntrust%20Team%2C%20I%20would%20like%20to%20consult%20with%20an%20expert%20for%20my%20business.";

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with a Fyntrust Expert on WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:bg-[#20bd5a] transition-all duration-300 transform hover:scale-105 active:scale-95 group font-body"
    >
      <div className="relative">
        <MessageSquare className="w-5 h-5 fill-current" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-ping" />
      </div>
      <span className="text-xs md:text-sm font-semibold tracking-wide hidden sm:inline-block">
        Chat with CA / Expert
      </span>
    </a>
  );
};
