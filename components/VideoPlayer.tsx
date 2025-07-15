"use client";

import React, { useState, useRef, useEffect } from "react";

import Timeline from "@/components/TimeLine";
import VideoRange from "@/components/VideoRange";
import { GET_DURATION_API } from "@/const/API.const";
import { GetDurationInterface } from "@/interface/GetDuration.interface";
import { makeRequest } from "@/utils/baseFetch";

const VideoPlayer = ({ videoSrc, videoName }: { videoSrc: string; videoName: string }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [duration, setDuration] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<number>(0);

    const handleSeek = (time: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const fetchDuration = async (videoName: string) => {
        try {
            const res = await makeRequest<GetDurationInterface>(GET_DURATION_API, "POST", { videoName });

            setDuration(res.duration);
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const onTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            // console.log("Current time:", video.currentTime);
        };

        const onError = (e: Event) => {
            console.error("Video error:", e);
        };

        video.addEventListener("timeupdate", onTimeUpdate);
        video.addEventListener("error", onError);

        return () => {
            video.removeEventListener("timeupdate", onTimeUpdate);
            video.removeEventListener("error", onError);
        };
    }, []);

    useEffect(() => {
        fetchDuration(videoName);
    }, []);

    return (
        <div>
            <video
                ref={videoRef}
                controls
                src={videoSrc}
                className="w-full max-h-[300px] object-cover rounded-2xl shadow-md"
            />
            {duration > 0 && (
                <>
                    <Timeline videoName={videoName} currentTime={currentTime} onSeek={handleSeek} duration={duration} />
                    <VideoRange videoName={videoName} duration={duration} />
                </>
            )}
        </div>
    );
};

export default VideoPlayer;
