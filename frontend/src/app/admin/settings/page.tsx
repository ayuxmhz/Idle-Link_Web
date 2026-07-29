"use client";

import { useUser } from "../../context/UserContext";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Link from "next/link";
import { ArrowLeft, Camera, ChevronRight, KeyRound, User2, Mail, Shield } from "lucide-react";
import Image from "next/image";
import { resolveImageUrl } from "@/lib/api/axios-instance";
import ImageCropModal from "@/components/ImageCropModal";

export default function AdminSettingsPage() {
  const { user, fetchUser, loading } = useUser();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoMessage, setPhotoMessage] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (user?.profilePicture) {
        setPreviewImage(resolveImageUrl(user.profilePicture));
      }
    })();
  }, [user]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRawImageSrc(URL.createObjectURL(file));
  };

  const handleCropConfirm = (file: File) => {
    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
    setRawImageSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCropCancel = () => {
    setRawImageSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const cancelPhotoUpload = () => {
    setSelectedFile(null);
    setPreviewImage(resolveImageUrl(user?.profilePicture));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const savePhoto = async () => {
    if (!selectedFile) return;

    setUploadingPhoto(true);
    setPhotoMessage("");
    setPhotoError("");

    try {
      const formData = new FormData();
      formData.append("profilePicture", selectedFile);
      if (user?.firstName) formData.append("firstName", user.firstName);
      if (user?.lastName) formData.append("lastName", user.lastName);

      const token = Cookies.get("auth_token");
      await axios.put("/api/v1/auth/update", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setPhotoMessage("Profile photo updated!");
      setSelectedFile(null);
      await fetchUser();
    } catch (err) {
      setPhotoError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to update photo");
      cancelPhotoUpload();
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111218] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#cbbefa] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || "User";
  const initials = (user?.firstName?.[0] || user?.username?.[0] || "U").toUpperCase();

  return (
    <div className="min-h-screen bg-[#111218] text-white">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 border-b border-[#2a2b36]">
        <Link
          href="/admin"
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#1a1b25] hover:bg-[#22233a] border border-[#2a2b36] text-gray-400 hover:text-white transition-all"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Settings</h1>
          <p className="text-xs text-gray-500">Manage your admin profile settings</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">

        {/* Profile Card */}
        <div className="bg-[#16171f] border border-[#2a2b36] rounded-xl overflow-hidden">
          {/* Cover Banner — a custom image takes priority over a solid
              color; both fall back to the default gradient. */}
          <div
            className={`h-24 ${
              !user?.coverImage && !user?.coverColor
                ? "bg-gradient-to-r from-[#2c2057] via-[#3d2a7a] to-[#1a1b2e]"
                : ""
            }`}
            style={
              user?.coverImage
                ? { backgroundImage: `url(${resolveImageUrl(user.coverImage)})`, backgroundSize: "cover", backgroundPosition: "center" }
                : user?.coverColor
                ? { backgroundColor: user.coverColor }
                : undefined
            }
          />

          {/* Avatar + Info */}
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-12 mb-4">
              {/* Avatar with camera button */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-[#16171f] overflow-hidden bg-[#2a2b36]">
                  {previewImage ? (
                    <Image
                      src={previewImage}
                      alt="Profile"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                      unoptimized
                      onError={() => setPreviewImage(null)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-[#cbbefa]">
                      {initials}
                    </div>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />

                {rawImageSrc && (
                  <ImageCropModal
                    imageSrc={rawImageSrc}
                    aspect={1}
                    cropShape="round"
                    fileName="profile-picture.png"
                    onCancel={handleCropCancel}
                    onConfirm={handleCropConfirm}
                  />
                )}

                {/* Camera button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-[#cbbefa] hover:bg-[#b8abeb] text-[#2c2057] rounded-full flex items-center justify-center transition-all shadow-lg disabled:opacity-60"
                  title="Change photo"
                >
                  {uploadingPhoto ? (
                    <div className="w-3.5 h-3.5 border-2 border-[#2c2057] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera size={14} strokeWidth={2.5} />
                  )}
                </button>
              </div>

              <div className="text-right">
                <span className="text-xs px-2.5 py-1 bg-[#cbbefa]/10 text-[#cbbefa] border border-[#cbbefa]/20 rounded-full font-medium capitalize">
                  {user?.role || "admin"}
                </span>
              </div>
            </div>

            {selectedFile && (
              <div className="flex gap-3 mb-4">
                <button
                  onClick={savePhoto}
                  disabled={uploadingPhoto}
                  className="px-4 py-1.5 bg-[#cbbefa] text-[#2c2057] text-xs font-bold rounded-lg disabled:opacity-60 transition-colors"
                >
                  {uploadingPhoto ? "Saving..." : "Save Photo"}
                </button>
                <button
                  onClick={cancelPhotoUpload}
                  disabled={uploadingPhoto}
                  className="px-4 py-1.5 bg-transparent border border-gray-600 text-gray-300 hover:text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            <h2 className="text-xl font-bold text-white">{displayName}</h2>
            <p className="text-sm text-gray-400 mt-0.5">@{user?.username}</p>

            {/* Feedback messages */}
            {photoMessage && (
              <p className="mt-3 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg">
                ✓ {photoMessage}
              </p>
            )}
            {photoError && (
              <p className="mt-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
                {photoError}
              </p>
            )}
          </div>
        </div>

        {/* Account Info Card */}
        <div className="bg-[#16171f] border border-[#2a2b36] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#2a2b36]">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Account Info</h3>
          </div>
          <div className="divide-y divide-[#2a2b36]">
            <div className="px-5 py-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-[#2a2b36] flex items-center justify-center text-gray-400">
                <User2 size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Full Name</p>
                <p className="text-sm text-white font-medium truncate">{displayName}</p>
              </div>
            </div>
            <div className="px-5 py-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-[#2a2b36] flex items-center justify-center text-gray-400">
                <Mail size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Email Address</p>
                <p className="text-sm text-white font-medium truncate">{user?.email}</p>
              </div>
            </div>
            <div className="px-5 py-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-[#2a2b36] flex items-center justify-center text-gray-400">
                <Shield size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Username</p>
                <p className="text-sm text-white font-medium">@{user?.username}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Links Card */}
        <div className="bg-[#16171f] border border-[#2a2b36] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#2a2b36]">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Settings</h3>
          </div>
          <div className="divide-y divide-[#2a2b36]">
            <Link
              href="/admin/settings/edit"
              className="px-5 py-4 flex items-center gap-4 hover:bg-[#1a1b25] transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-[#cbbefa]/10 flex items-center justify-center text-[#cbbefa]">
                <User2 size={16} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white font-medium">Edit Profile</p>
                <p className="text-xs text-gray-500">Update your name and display info</p>
              </div>
              <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
            </Link>
            <Link
              href="/admin/settings/password"
              className="px-5 py-4 flex items-center gap-4 hover:bg-[#1a1b25] transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-[#cbbefa]/10 flex items-center justify-center text-[#cbbefa]">
                <KeyRound size={16} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white font-medium">Change Password</p>
                <p className="text-xs text-gray-500">Update your account password</p>
              </div>
              <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
