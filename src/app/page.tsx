"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type Bottle = {
  id: string;
  image_url: string;
  x_position: number | null;
  y_position: number | null;
};

export default function Home() {
  const [items, setItems] = useState<Bottle[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all drawings from Supabase
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("bottles")
        .select("*")
        .order("id", { ascending: false })
        .limit(100);

      if (!error && data) {
        setItems(data);
      }

      setLoading(false);
    };

    load();
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden">

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-10">
        <h1 className="text-lg font-semibold text-blue-900">Message in a Bottle 🐚</h1>

        <Link
          href="/draw"
          className="px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600"
        >
          Draw yours
        </Link>
      </div>

      {/* Ocean background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#a5e3ff] via-[#ccefff] to-[#eaf7ff]" />

      {/* Floating bubbles */}
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="absolute w-4 h-4 bg-white/60 rounded-full animate-[float_6s_ease-in-out_infinite]"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDuration: `${4 + Math.random() * 6}s`,
          }}
        />
      ))}

      {/* Drawings floating */}
      {!loading &&
        items.map((item) => (
          <img
            key={item.id}
            src={item.image_url}
            alt="user drawing"
            className="absolute w-16 h-16 object-contain animate-[float_5s_ease-in-out_infinite]"
            style={{
              left: `${item.x_position}%`,
              top: `${item.y_position}%`,
            }}
          />
        ))}

      {loading && (
        <p className="absolute inset-0 flex justify-center items-center text-blue-900/70">
          Loading ocean…
        </p>
      )}
    </main>
  );
}
