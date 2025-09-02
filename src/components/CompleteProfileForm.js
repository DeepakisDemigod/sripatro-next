"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CompleteProfileForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const [role, setRole] = useState("user");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [languages, setLanguages] = useState("");
  const [services, setServices] = useState([
    { title: "", price: "", description: "" },
  ]);
  const [loading, setLoading] = useState(false);

  function addService() {
    setServices((s) => [...s, { title: "", price: "", description: "" }]);
  }
  function updateService(i, key, val) {
    setServices((s) =>
      s.map((svc, idx) => (idx === i ? { ...svc, [key]: val } : svc))
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!session || !session.user || !session.user.email) {
      alert("You must be signed in to complete your profile.");
      setLoading(false);
      return;
    }
    setLoading(true);
    const payload = {
      email: session.user.email,
      role,
      name,
      bio,
      languages: languages
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      services:
        role === "astrologer"
          ? services.map((s) => ({
              title: s.title,
              price: Number(s.price) || 0,
              description: s.description,
            }))
          : [],
    };
    const res = await fetch("/api/users/upsert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      router.push("/astrologers");
    } else {
      alert("Error saving profile");
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin");
    }
  }, [session, router]);

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto p-6 bg-base-100 rounded-lg shadow-lg border border-red-600"
    >
      <h2 className="text-2xl font-bold mb-6 text-red-600">
        {session?.user?.email}{" "}
        <span className="block text-base text-gray-700">
          Finish creating your profile
        </span>
      </h2>

      <label className="block mb-2 font-semibold">I am a</label>
      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={role === "user"}
            onChange={() => setRole("user")}
            className="radio radio-sm radio-error border-red-600"
          />
          <span className="text-sm">User</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={role === "astrologer"}
            onChange={() => setRole("astrologer")}
            className="radio radio-sm radio-error border-red-600"
          />
          <span className="text-sm">Astrologer</span>
        </label>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Select <b className="text-red-600">Astrologer</b> if you want your
        profile to be visible on the astrologers page.
      </p>

      <label className="block font-semibold">Display name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="input input-bordered w-full mb-3 border-red-600 focus:border-red-600 focus:ring-red-600"
      />

      <label className="block font-semibold">Bio</label>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="textarea textarea-bordered w-full mb-3 border-red-600 focus:border-red-600 focus:ring-red-600"
      />

      <label className="block font-semibold">Languages (comma separated)</label>
      <input
        value={languages}
        onChange={(e) => setLanguages(e.target.value)}
        className="input input-bordered w-full mb-3 border-red-600 focus:border-red-600 focus:ring-red-600"
      />

      {role === "astrologer" && (
        <>
          <h3 className="font-semibold mt-4 text-red-600">Services</h3>
          {services.map((svc, i) => (
            <div
              key={i}
              className="border border-red-600 p-3 my-2 rounded-lg bg-base-200"
            >
              <input
                placeholder="Title"
                value={svc.title}
                onChange={(e) => updateService(i, "title", e.target.value)}
                className="input input-bordered w-full mb-1 border-red-600 focus:border-red-600 focus:ring-red-600"
              />
              <input
                placeholder="Price"
                value={svc.price}
                onChange={(e) => updateService(i, "price", e.target.value)}
                className="input input-bordered w-full mb-1 border-red-600 focus:border-red-600 focus:ring-red-600"
              />
              <input
                placeholder="Short description"
                value={svc.description}
                onChange={(e) =>
                  updateService(i, "description", e.target.value)
                }
                className="input input-bordered w-full mb-1 border-red-600 focus:border-red-600 focus:ring-red-600"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addService}
            className="btn btn-outline btn-error mt-2 border-red-600 text-red-600"
          >
            Add service
          </button>
        </>
      )}

      <div className="mt-6 flex justify-end">
        <button
          disabled={loading}
          className="btn bg-red-600 text-white px-6 py-2 rounded shadow hover:bg-red-700 border-none"
        >
          {loading ? "Saving..." : "Save profile"}
        </button>
      </div>
    </form>
  );
}
