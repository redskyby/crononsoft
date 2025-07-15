"use client";

import React, { useState, useEffect } from "react";

import Spinner from "@/components/Spinner";
import { TIME_LINE_API } from "@/const/API.const";
import { THUMBNAIL_HEIGHT, THUMBNAIL_WIDTH } from "@/const/TimeLine.const";
import { TimeLineInterface } from "@/interface/TimeLine.Interface";
import { TimelineProps } from "@/interface/TimeLine.Props";
import { makeRequest } from "@/utils/baseFetch";

const Timeline = ({ videoName, currentTime, onSeek, duration }: TimelineProps) => {
    const [thumbnails, setThumbnails] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchThumbnails = async (videoName: string) => {
        try {
            setLoading(true);
            setError(null);
            const res = await makeRequest<TimeLineInterface>(TIME_LINE_API, "POST", { videoName });

            setThumbnails(res.thumbnails || []);
        } catch (e) {
            console.log(e);
            setError((e as Error).message || "Неизвестная ошибка");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (videoName) {
            fetchThumbnails(videoName);
        }
    }, [videoName]);

    if (loading) {
        return <Spinner />;
    }

    if (error) {
        return <div className="text-red-600 text-sm font-medium">{error}</div>;
    }

    // Длительность сегмента для каждого превью
    const segmentDuration = duration / thumbnails.length || 0;

    // Позиция курсора (красная линия) по текущему времени
    const cursorPos = duration ? (currentTime / duration) * thumbnails.length * THUMBNAIL_WIDTH : 0;

    // Обработчик клика на таймлайн
    const onTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;

        // Перемотка по клику: рассчитываем время, соответствующее позиции клика
        const clickTime = (clickX / rect.width) * duration;
        onSeek(clickTime);
    };

    console.log(thumbnails);

    return (
        <div className="relative px-2 overflow-x-auto max-w-full">
            {/* Курсор — красная вертикальная линия */}
            <div
                className="absolute top-0 w-[2px] bg-red-600 pointer-events-none transition-all duration-100 z-10"
                style={{ left: cursorPos, height: THUMBNAIL_HEIGHT }}
            />

            {/* Таймлайн с превью */}
            <div className="flex gap-2 cursor-pointer" onClick={onTimelineClick}>
                {thumbnails.map((src, i) => (
                    <img
                        key={i}
                        src={src}
                        alt={`Thumbnail ${i + 1}`}
                        width={THUMBNAIL_WIDTH}
                        height={THUMBNAIL_HEIGHT}
                        className="object-cover"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSeek(i * segmentDuration);
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default Timeline;
