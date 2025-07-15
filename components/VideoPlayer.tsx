import React, { useState, useRef, useEffect } from "react";
import VideoRange from "@/components/VideoRange";
import Timeline from "@/components/TimeLine";

const VideoPlayer = ({ VIDEO_SRC, VIDEO_NAME }: { VIDEO_SRC: string; VIDEO_NAME: string }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    const handleSeek = (time: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            console.log(time, "----------");
            setCurrentTime(time);
        }
    };

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const onLoadedMetadata = () => {
            if (video.duration && !isNaN(video.duration)) {
                setDuration(video.duration);
            } else {
                console.error("Duration is not available");
            }
        };

        const onTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            console.log("Current time:", video.currentTime);
        };

        const onError = (e: Event) => {
            console.error("Video error:", e);
        };

        video.addEventListener("loadedmetadata", onLoadedMetadata);
        video.addEventListener("timeupdate", onTimeUpdate);
        video.addEventListener("error", onError);

        if (video.readyState >= 1 && !isNaN(video.duration) && video.duration > 0) {
            setDuration(video.duration);
        }

        return () => {
            video.removeEventListener("loadedmetadata", onLoadedMetadata);
            video.removeEventListener("timeupdate", onTimeUpdate);
            video.removeEventListener("error", onError);
        };
    }, []);


    return (
        <div>
            <video ref={videoRef} controls src={VIDEO_SRC} className="w-full max-h-[300px] object-cover" />
            <Timeline videoName={VIDEO_NAME} currentTime={currentTime} duration={duration} onSeek={handleSeek} />
            <VideoRange videoName={VIDEO_NAME} />
        </div>
    );
};

export default VideoPlayer;
