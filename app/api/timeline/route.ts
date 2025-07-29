import fs from "fs/promises";
import path from "path";

import ffmpeg from "fluent-ffmpeg";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { FILE_FRAMES } from "@/const/File.const";
import { ErrorInterface } from "@/interface/Error.interface";
import { TimeLineInterface } from "@/interface/TimeLine.Interface";

const FFMPEG_PATH = "/usr/bin/ffmpeg"; // Путь к ffmpeg в WSL
ffmpeg.setFfmpegPath(FFMPEG_PATH);

// ffmpeg.setFfmpegPath("ffmpeg");

export async function POST(req: Request): Promise<NextResponse<TimeLineInterface | ErrorInterface>> {
    try {
        const { videoName } = await req.json();

        if (!videoName) {
            return NextResponse.json({ error: "Missing or invalid videoName" }, { status: 400 });
        }

        const uploadDir = path.join(process.cwd(), "public", "uploads");
        const outputDir = path.join(uploadDir, "frames");
        const videoPath = path.join(uploadDir, videoName);

        // Очистить папку frames, если она существует
        try {
            const files = await fs.readdir(outputDir);
            await Promise.all(files.map((file) => fs.unlink(path.join(outputDir, file))));
        } catch (err) {
            // Если папки нет — игнорируем ошибку
            if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
        }

        await fs.mkdir(outputDir, { recursive: true });

        const uniquePrefix = uuidv4();

        return new Promise((resolve, reject) => {
            ffmpeg(videoPath)
                .on("filenames", (filenames) => {
                    console.log("Generated thumbnails:", filenames);
                })
                .on("end", () => {
                    const thumbnails = [];
                    for (let i = 1; i <= 10; i++) {
                        thumbnails.push(`${FILE_FRAMES}${uniquePrefix}-${i}.jpg`);
                    }
                    resolve(NextResponse.json({ thumbnails }));
                })
                .on("error", (err) => {
                    console.error("FFmpeg error:", err);
                    reject(NextResponse.json({ error: "FFmpeg failed" }, { status: 500 }));
                })
                .screenshots({
                    count: 10,
                    folder: outputDir,
                    filename: `${uniquePrefix}-%i.jpg`,
                    size: "160x90",
                });
        });
    } catch (e) {
        console.error("Unexpected error:", e);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
