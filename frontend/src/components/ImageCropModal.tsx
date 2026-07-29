"use client";

import { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { X, Check, ZoomIn } from "lucide-react";
import { getCroppedImageFile } from "@/lib/cropImage";

interface ImageCropModalProps {
    imageSrc: string;
    aspect: number;
    cropShape: "round" | "rect";
    fileName: string;
    mimeType?: string;
    onCancel: () => void;
    onConfirm: (file: File) => void;
}

export default function ImageCropModal({
    imageSrc,
    aspect,
    cropShape,
    fileName,
    mimeType,
    onCancel,
    onConfirm,
}: ImageCropModalProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const onCropComplete = useCallback((_: Area, pixels: Area) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const handleConfirm = async () => {
        if (!croppedAreaPixels) return;
        setIsSaving(true);
        try {
            const file = await getCroppedImageFile(imageSrc, croppedAreaPixels, fileName, mimeType);
            onConfirm(file);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-[#16171f] border border-[#2a2b36] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-[#2a2b36]">
                    <h3 className="text-sm font-bold text-white">Adjust image</h3>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-[#2a2b36]"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="relative w-full h-80 bg-[#0c0d16]">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        cropShape={cropShape}
                        showGrid={cropShape === "rect"}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                </div>

                <div className="p-4 space-y-4">
                    <div className="flex items-center gap-3">
                        <ZoomIn size={16} className="text-gray-400 shrink-0" />
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.01}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full accent-[#cbbefa]"
                            aria-label="Zoom"
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isSaving}
                            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-transparent border border-gray-600 rounded-lg transition-colors hover:bg-gray-800 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={isSaving || !croppedAreaPixels}
                            className="px-5 py-2 text-sm font-bold text-[#2c2057] bg-[#cbbefa] hover:bg-[#b8abeb] rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <div className="w-4 h-4 border-2 border-[#2c2057] border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Check size={16} />
                            )}
                            {isSaving ? "Applying..." : "Apply"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
