"use client";

import React, { useState, useEffect } from "react";
import { HeartIcon, ShareNetworkIcon } from "@phosphor-icons/react/dist/ssr";

type SaveAndShareProps = {
  apartmentId: string | number;
  t: (key: string) => string;
};

export const SaveAndShare = ({ apartmentId, t }: SaveAndShareProps) => {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedList = JSON.parse(localStorage.getItem("saved_apartments") || "[]");
    if (savedList.includes(apartmentId)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSaved(true);
    }
  }, [apartmentId]);

  const toggleSave = () => {
    let savedList = JSON.parse(localStorage.getItem("saved_apartments") || "[]");
    if (isSaved) {
      savedList = savedList.filter((id: string | number) => id !== apartmentId);
    } else {
      savedList.push(apartmentId);
    }
    localStorage.setItem("saved_apartments", JSON.stringify(savedList));
    setIsSaved(!isSaved);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(t("link_copied") || "Link copied to clipboard!");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleShare}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-background-subtle hover:bg-background-muted transition-colors text-foreground"
        aria-label={t("share")}
        title={t("share")}
      >
        <ShareNetworkIcon weight="duotone" className="w-5 h-5" />
      </button>
      <button
        onClick={toggleSave}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
          isSaved ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "bg-background-subtle text-foreground hover:bg-background-muted"
        }`}
        aria-label={isSaved ? t("saved") : t("save")}
        title={isSaved ? t("saved") : t("save")}
      >
        <HeartIcon weight={isSaved ? "fill" : "duotone"} className="w-5 h-5" />
      </button>
    </div>
  );
};
