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

    return (
        <Formik
            initialValues={{ video: null }}
            validationSchema={UploadSchema}
            onSubmit={(values) => {
                console.log("Файл:", values.video);
            }}
        >
            {({ setFieldValue }) => (
                <Form>
                    <input
                        name="video"
                        type="file"
                        accept="video/mp4"
                        onChange={(e) => handleUpload(e, setFieldValue)}
                    />
                    <ErrorMessage name="video" component="div" className="text-red-950" />

                    {videoSrc && <video controls width="600" src={videoSrc}></video>}

                    <button type="submit" className="text-red-950">
                        Загрузить
                    </button>
                </Form>
            )}
        </Formik>
    );
};

export default VideoUploader;
