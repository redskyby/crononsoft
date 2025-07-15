import React from "react";
import { DOWNLOAD_API } from "@/const/API.const";

const VideoDownloader = ({ path }: { path: string | null }) => {
    const filePath = path ? `${DOWNLOAD_API}${path}` : null;

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
