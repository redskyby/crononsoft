import React from "react";

const VideoDownloader = ({ path }: { path: string | null }) => {
    const filePath = path ? `/uploads/${path}` : null;

    console.log("path", filePath);
    return (
        <div>
            {filePath && (
                <a href={filePath!} download>
                    📥 Скачать видео
                </a>
            )}
        </div>
    );
};

export default VideoDownloader;
