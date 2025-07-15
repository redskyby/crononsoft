import { NextResponse } from "next/server";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { ErrorInterface } from "@/interface/Error.interface";
import { VideoEditInterface } from "@/interface/VideoEdit.interface";

// const FFMPEG_PATH = '/usr/bin/ffmpeg'; // Путь к ffmpeg в WSL
// ffmpeg.setFfmpegPath(FFMPEG_PATH);

ffmpeg.setFfmpegPath("ffmpeg");

export async function POST(req: Request): Promise<NextResponse<VideoEditInterface | ErrorInterface>> {
    try {
        const { videoName, start, end } = await req.json();

        if (!videoName || start == null || end == null) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const projectRoot = process.cwd();
        const uploadsDir = path.join(projectRoot, "public", "uploads");
        const trimmedDir = path.join(uploadsDir, "trimmed");

        const videoPath = path.join(uploadsDir, videoName);
        const fileExt = path.extname(videoName);

        const uniqueName = uuidv4();
        const trimmedFileName = `${uniqueName}${fileExt}`;
        const outputVideoPath = path.join(trimmedDir, trimmedFileName);

        await fs.mkdir(path.dirname(outputVideoPath), { recursive: true });

        await new Promise((resolve, reject) => {
            ffmpeg(videoPath)
                .setStartTime(start)
                .setDuration(end)
                .output(outputVideoPath)
                .on("end", resolve)
                .on("error", reject)
                .run();
        });

        return NextResponse.json({ trimmedVideo: "/uploads/trimmed/trimmed-video.mp4" });
    } catch (e) {
        return NextResponse.json({ error: "Failed to trim video" }, { status: 500 });
    }
}
