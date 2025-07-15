"use client";

import noUiSlider from "nouislider";
import React, { useEffect, useRef, useState } from "react";

import "nouislider/dist/nouislider.css";
import { VIDEO_EDIT_API } from "@/const/API.const";
import { SliderElementInterface } from "@/interface/SliderElement.interface";
import { VideoEditInterface } from "@/interface/VideoEdit.interface";
import { makeRequest } from "@/utils/baseFetch";

const VideoRange = ({ videoName, duration }: { videoName: string; duration: number }) => {
    const sliderRef = useRef<HTMLDivElement & SliderElementInterface>(null);
    const [start, setStart] = useState<number>(0);
    const [end, setEnd] = useState<number>(0);

    const handleCut = async (videoName: string, start: number, end: number) => {
        try {
            await makeRequest<VideoEditInterface>(VIDEO_EDIT_API, "POST", { videoName, start, end });
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        if (!sliderRef.current) return;

        const slider = sliderRef.current;

        noUiSlider.create(slider, {
            start: [0, 80],
            connect: true,
            range: {
                min: 0,
                max: duration,
            },
            step: 0.01,
        });

        // Подписка на события изменения
        slider.noUiSlider?.on("update", (values) => {
            const start = Number(parseFloat(String(values[0])).toFixed(2));
            const end = Number(parseFloat(String(values[1])).toFixed(2));
            setStart(start);
            setEnd(end);
        });

        return () => {
            slider.noUiSlider?.destroy();
        };
    }, []);

    const updateSlider = (newStart: number, newEnd: number) => {
        const slider = sliderRef.current;
        if (slider?.noUiSlider) {
            slider.noUiSlider.set([newStart, newEnd]);
        }
    };

    return (
        <div>
            <div ref={sliderRef} />
            <div className="flex items-center gap-4">
                <div>
                    <label className="block text-sm font-medium">Start (сек)</label>
                    <input
                        type="number"
                        min={0}
                        max={end}
                        step={0.01}
                        value={start}
                        onChange={(e) => {
                            const val = Math.min(Math.max(0, parseFloat(e.target.value)), end);
                            setStart(val);
                            updateSlider(val, end);
                        }}
                        className="border rounded px-2 py-1 w-24"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">End (сек)</label>
                    <input
                        type="number"
                        min={start}
                        max={duration}
                        step={0.01}
                        value={end}
                        onChange={(e) => {
                            const val = Math.max(Math.min(parseFloat(e.target.value), duration), start);
                            setEnd(val);
                            updateSlider(start, val);
                        }}
                        className="border rounded px-2 py-1 w-24"
                    />
                </div>
            </div>
            <div className="flex justify-center items-center mt-8! mb-8!    ">
                <button
                    onClick={() => handleCut(videoName, start, end)}
                    className="px-6! py-2! bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                    Скачать обрезанную версию
                </button>
            </div>
        </div>
    );
};

export default VideoRange;
