import { NextResponse } from "next/server";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs/promises";
import path from "path";
import { ErrorInterface } from "@/interface/Error.interface";
import { GetDurationInterface } from "@/interface/GetDuration.interface";

// const FFMPEG_PATH = '/usr/bin/ffmpeg'; // Путь к ffmpeg в WSL
// ffmpeg.setFfmpegPath(FFMPEG_PATH);

ffmpeg.setFfmpegPath("ffmpeg");

export async function POST(req: Request): Promise<NextResponse<GetDurationInterface | ErrorInterface>> {
    try {
        const { videoName } = await req.json();

        if (!videoName) {
            return NextResponse.json({ error: "Missing videoName" }, { status: 400 });
        }

        const projectRoot = process.cwd();
        const uploadsDir = path.join(projectRoot, "public", "uploads");
        const videoPath = path.join(uploadsDir, videoName);

        try {
            await fs.access(videoPath);
        } catch {
            return NextResponse.json({ error: "Video file not found" }, { status: 404 });
        }

        const duration = await new Promise<number>((resolve, reject) => {
            ffmpeg.ffprobe(videoPath, (err, metadata) => {
                if (err) return reject(err);
                const duration = metadata.format.duration;
                if (typeof duration === "number") {
                    resolve(duration);
                } else {
                    reject(new Error("Duration not found in metadata"));
                }
            });
        });

        return NextResponse.json({ duration });
    } catch (e) {
        console.error("Failed to get video duration:", e);
        return NextResponse.json({ error: "Failed to get video duration" }, { status: 500 });
    }
}
