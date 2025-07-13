import React, { useState,  useEffect } from 'react';
import VideoRange from "@/components/VideoRange";

// const VIDEO_SRC = '/uploads/92c60d62-922c-485f-828e-5e04568a1b54.mp4'; // путь к видео в public
// const VIDEO_NAME = '92c60d62-922c-485f-828e-5e04568a1b54.mp4';

interface TimelineProps {
    videoName: string;
    currentTime: number;
    duration: number;
    onSeek: (time: number) => void;
}

const Timeline: React.FC<TimelineProps> = ({ videoName, currentTime, duration, onSeek }) => {
    const [thumbnails, setThumbnails] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        const fetchThumbnails = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/timeline', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ videoName }),
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Ошибка при загрузке превью');
                }

                const data = await res.json();
                setThumbnails(data.thumbnails || []);
            } catch (e: any) {
                setError(e.message || 'Неизвестная ошибка');
            } finally {
                setLoading(false);
            }
        };

        if (videoName) {
            fetchThumbnails();
        }
    }, [videoName]);

    if (loading) return <div>Загрузка превью...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (thumbnails.length === 0) return <div>Превью не найдено</div>;

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
        <div style={{ position: 'relative', padding: 8, overflowX: 'auto', maxWidth: '100%' }}>
            {/* Курсор — красная вертикальная линия */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: cursorPos,
                    width: 2,
                    height: THUMBNAIL_HEIGHT,
                    backgroundColor: 'red',
                    pointerEvents: 'none',
                    transition: 'left 0.1s linear',
                    zIndex: 10,
                }}
            />

            {/* Таймлайн с превью — обертка для клика */}
            <div
                style={{ display: 'flex', gap: 8, cursor: 'pointer' }}
                onClick={onTimelineClick}
            >
                {thumbnails.map((src, i) => (
                    <img
                        key={i}
                        src={src}
                        alt={`Thumbnail ${i + 1}`}
                        width={THUMBNAIL_WIDTH}
                        height={THUMBNAIL_HEIGHT}
                        style={{ objectFit: 'cover' }}
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