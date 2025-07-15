import { NextResponse } from "next/server";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs/promises";
import { ErrorInterface } from "@/interface/Error.interface";
import path from "path";
import { TimeLineInterface } from "@/interface/TimeLine.Interface";
import { v4 as uuidv4 } from "uuid";
import { FILE_FRAMES } from "@/const/File.const";

ffmpeg.setFfmpegPath("ffmpeg");

export async function POST(req: Request): Promise<NextResponse<TimeLineInterface | ErrorInterface>> {
    try {
        const { videoName } = await req.json();

        const uploadDir = path.join(process.cwd(), "public", "uploads");
        const outputDir = path.join(uploadDir, "frames");
        const videoPath = path.join(uploadDir, videoName);

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
