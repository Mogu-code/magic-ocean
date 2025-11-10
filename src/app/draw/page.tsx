"use client";
import { useRouter } from "next/navigation";
import CanvasBoard from "@/lib/CanvasBoard";

import { supabase } from "@/lib/supabaseClient";

export default function DrawPage() {
  const router = useRouter();

  const handleSave = async (blob: Blob) => {
    const filename = `drawing-${Date.now()}.png`;
    const { error: uploadErr, data: uploadData } = await supabase
      .storage
      .from("seacreature-images")
      .upload(filename, blob, { contentType: "image/png", upsert: false });

    if (uploadErr) {
      alert("Upload error: " + uploadErr.message);
      return;
    }

    // get public URL
    const { data: pub } = supabase.storage.from("seacreature-images").getPublicUrl(filename);
    const imageUrl = pub.publicUrl;

    // random placement (0..100 represents % inside ocean container)
    const x = Math.random() * 100;
    const y = 20 + Math.random() * 60; // keep near middle/deeper area

    const { error: insertErr } = await supabase.from("bottles").insert({
      image_url: imageUrl,
      x_position: x,
      y_position: y,
    });

    if (insertErr) {
      alert("DB error: " + insertErr.message);
      return;
    }

    router.push("/"); // back to ocean
  };

  return (
    <main className="min-h-screen py-16 px-4 flex flex-col items-center">
      <h1 className="text-3xl font-semibold mb-6 text-blue-900">Draw your sea creature 🐚</h1>
      <CanvasBoard onSave={handleSave} />
      <p className="mt-4 text-sm text-blue-900/70">Tip: simple shapes look cutest (fish, shells, jellyfish)</p>
    </main>
  );
}
