"use client";

import { Formik, Form, ErrorMessage } from "formik";
import React, { useEffect, useState } from "react";

import VideoPlayer from "@/components/VideoPlayer";
import { UPLOAD_API } from "@/const/API.const";
import { UploadInterface } from "@/interface/Upload.interface";
import { makeRequest } from "@/utils/baseFetch";
import { UploadSchema } from "@/validationShema/Upload.Schema";

import Spinner from "./Spinner";

const VideoUploader = () => {
    const [videoSrc, setVideoSrc] = useState<string | null>(null);
    const [videoName, serVideoName] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
        setFieldValue: (field: string, value: File | null, shouldValidate?: boolean) => void,
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
        try {
            setLoading(true);

            if (!values.video) return;

            const formData = new FormData();
            formData.append("video", values.video);

            const res = await makeRequest<UploadInterface>(UPLOAD_API, "POST", formData);

            serVideoName(res.uniqueFileName);
            resetForm();
        } catch (e) {
            console.log("Ошибка:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            if (videoSrc) {
                URL.revokeObjectURL(videoSrc);
            }
        };
    }, [videoSrc]);

    if (loading) {
        return <Spinner />;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
            <div className="w-full max-w-lg">
                <Formik initialValues={{ video: null }} validationSchema={UploadSchema} onSubmit={handleSubmit}>
                    {({ setFieldValue }) => (
                        <Form className="space-y-4">
                            <div className="text-center">
                                <h2 className="text-xl font-semibold">Загрузка видео</h2>
                                <p className="text-sm text-gray-600">Выберите видео в формате MP4</p>
                            </div>

                            <div className="border border-gray-300 rounded p-4 text-center">
                                <input
                                    name="video"
                                    type="file"
                                    accept="video/mp4"
                                    className="hidden"
                                    id="video-upload"
                                    onChange={(e) => handleUpload(e, setFieldValue)}
                                />
                                <label htmlFor="video-upload" className="cursor-pointer">
                                    <div>
                                        <p className="text-gray-700">Нажмите для загрузки</p>
                                        <p className="text-xs text-gray-500 mt-1">MP4, максимум 100MB</p>
                                    </div>
                                </label>
                            </div>

                            <ErrorMessage name="video" component="div" className="text-red-600 text-sm text-center" />

                            {videoSrc && videoName && <VideoPlayer videoSrc={videoSrc} videoName={videoName} />}

                            <button
                                type="submit"
                                className="w-full py-2! px-4! bg-red-600 text-white rounded hover:bg-red-700 transition"
                            >
                                Загрузить видео
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default VideoUploader;
