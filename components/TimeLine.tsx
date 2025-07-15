import React, { useState, useEffect } from "react";
import Spinner from "@/components/Spinner";
import { makeRequest } from "@/utils/baseFetch";
import { TIME_LINE_API } from "@/const/API.const";
import { TimeLineInterface } from "@/interface/TimeLine.Interface";
import { TimelineProps } from "@/interface/TimeLine.Props";

const Timeline = ({ videoName, currentTime, duration, onSeek }: TimelineProps) => {
    const [thumbnails, setThumbnails] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchThumbnails = async (videoName: string) => {
        try {
            setLoading(true);
            setError(null);
            const res = await makeRequest<TimeLineInterface>(TIME_LINE_API, "POST", { videoName });

            setThumbnails(res.thumbnails || []);
        } catch (e: any) {
            console.log(e);
            setError(e.message || "Неизвестная ошибка");
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

    if (error) return <div style={{ color: "red" }}>{error}</div>;

    const THUMBNAIL_WIDTH = 160;
    const THUMBNAIL_HEIGHT = 90;

    // Длительность сегмента для каждого превью
    const segmentDuration = duration / thumbnails.length || 0;

    // Позиция курсора (красная линия) по текущему времени
    const cursorPos = duration ? (currentTime / duration) * thumbnails.length * THUMBNAIL_WIDTH : 0;

    // Обработчик клика на таймлайн (не только на превью)
    const onTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;

        // Перемотка по клику: рассчитываем время, соответствующее позиции клика
        const clickTime = (clickX / rect.width) * duration;
        onSeek(clickTime);
    };

    return (
        <div style={{ position: "relative", padding: 8, overflowX: "auto", maxWidth: "100%" }}>
            {/* Курсор — красная вертикальная линия */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: cursorPos,
                    width: 2,
                    height: THUMBNAIL_HEIGHT,
                    backgroundColor: "red",
                    pointerEvents: "none",
                    transition: "left 0.1s linear",
                    zIndex: 10,
                }}
            />

            {/* Таймлайн с превью — обертка для клика */}
            <div style={{ display: "flex", gap: 8, cursor: "pointer" }} onClick={onTimelineClick}>
                {thumbnails.map((src, i) => (
                    <img
                        key={i}
                        src={src}
                        alt={`Thumbnail ${i + 1}`}
                        width={THUMBNAIL_WIDTH}
                        height={THUMBNAIL_HEIGHT}
                        style={{ objectFit: "cover" }}
                        onClick={(e) => {
                            // Чтобы клик на превью не дублировался с родительским кликом
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
