"use client";

import { Formik, Form, ErrorMessage } from "formik";
import React, { useState } from "react";

import { UploadSchema } from "@/validationShema/Upload.Schema";

const VideoUploader = () => {
    const [videoSrc, setVideoSrc] = useState<string | null>(null);

    const handleUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
        setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void,
    ) => {
        const file = e.target.files?.[0];

        if (videoSrc) {
            URL.revokeObjectURL(videoSrc);
            setVideoSrc(null);
        }

        if (file) {
            const src = URL.createObjectURL(file);
            setVideoSrc(src);
            setFieldValue("video", file);
        } else {
            setFieldValue("video", null);
            setVideoSrc(null);
        }
    };

    const handleSubmit = async (values: { video: File | null }, { resetForm }: { resetForm: () => void }) => {
        if (!values.video) return;

        const formData = new FormData();
        formData.append("video", values.video);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || "Ошибка загрузки");
            }

            console.log("✅ Загружено:", result.message);
            resetForm(); // очистим форму
        } catch (err) {
            console.error("❌ Ошибка:", err);
        }
    };

    // TODO ДОБАВЬ УДАЛЕНИЕ ССЫЛКИ ПРИ РАЗМОНТИРОВАНИИ
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-lg bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6">
                    <Formik initialValues={{ video: null }} validationSchema={UploadSchema} onSubmit={handleSubmit}>
                        {({ setFieldValue }) => (
                            <Form className="space-y-6">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Загрузка видео</h2>
                                    <p className="text-gray-600">Выберите видео в формате MP4</p>
                                </div>

                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors hover:border-red-800 cursor-pointer">
                                    <input
                                        name="video"
                                        type="file"
                                        accept="video/mp4"
                                        className="hidden"
                                        id="video-upload"
                                        onChange={(e) => handleUpload(e, setFieldValue)}
                                    />
                                    <label htmlFor="video-upload" className="block w-full cursor-pointer">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg
                                                className="w-12 h-12 text-gray-400 mb-3"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                />
                                            </svg>
                                            <span className="text-gray-600 font-medium">Нажмите для загрузки</span>
                                            <p className="text-gray-500 text-sm mt-1">MP4, максимум 100MB</p>
                                        </div>
                                    </label>
                                </div>

                                <ErrorMessage
                                    name="video"
                                    component="div"
                                    className="text-red-600 text-sm text-center py-2"
                                />

                                {videoSrc && (
                                    <div className="rounded-lg overflow-hidden shadow-md">
                                        <video controls className="w-full h-[300px] object-cover" src={videoSrc} />
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full py-3 px-4 bg-gradient-to-r from-red-800 to-red-900 text-white font-medium rounded-lg hover:from-red-900 hover:to-red-800 transition-all shadow-md hover:shadow-lg"
                                >
                                    Загрузить видео
                                </button>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
};

export default VideoUploader;
