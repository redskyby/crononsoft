import React, { useState, useRef, useEffect } from 'react';
import Timeline from "@/components/TimeLine";

const VIDEO_SRC = '/uploads/92c60d62-922c-485f-828e-5e04568a1b54.mp4'; // путь к видео в public
const VIDEO_NAME = '92c60d62-922c-485f-828e-5e04568a1b54.mp4';
// const THUMBNAIL_COUNT = 10;
// const THUMBNAIL_WIDTH = 160;
// const THUMBNAIL_HEIGHT = 90;

const VideoPlayer = () => {
    const videoRef = useRef<HTMLVideoElement>(null);

    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const onLoadedMetadata = () => {
            if (video.duration && !isNaN(video.duration)) {
                setDuration(video.duration);
                // console.log('Video duration:', video.duration);
            } else {
                console.error('Duration is not available');
            }
        };

        const onTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            console.log('Current time:', video.currentTime);
        };

        const onError = (e: Event) => {
            console.error('Video error:', e);
        };

        video.addEventListener('loadedmetadata', onLoadedMetadata);
        video.addEventListener('timeupdate', onTimeUpdate);
        video.addEventListener('error', onError);

        // Принудительная загрузка метаданных, если видео уже готово
        if (video.readyState >= 1) {
            onLoadedMetadata();
        }

        return () => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('timeupdate', onTimeUpdate);
            video.removeEventListener('error', onError);
        };
    }, []);

    // console.log("duration" ,duration );

    const handleSeek = (time: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };




    return (
        <div>
            <video
                ref={videoRef}
                controls
                src={VIDEO_SRC}
                style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }}
            />

            <Timeline
                videoName={VIDEO_NAME}
                currentTime={currentTime}
                duration={duration}
                onSeek={handleSeek}
            />
        </div>
    );
};

export default VideoPlayer;
