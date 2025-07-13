import { NextResponse } from 'next/server';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';
import path from 'path';

const FFMPEG_PATH = '/usr/bin/ffmpeg'; // Путь к ffmpeg в WSL
ffmpeg.setFfmpegPath(FFMPEG_PATH);

export async function POST() {
    try {
        const videoPath = '/mnt/d/development/crononsoft/public/uploads/92c60d62-922c-485f-828e-5e04568a1b54.mp4';
        const outputVideoPath = '/mnt/d/development/crononsoft/public/uploads/trimmed/trimmed-video.mp4';

        await fs.mkdir(path.dirname(outputVideoPath), { recursive: true });

        await new Promise((resolve, reject) => {
            ffmpeg(videoPath)
                .setStartTime(2)
                .setDuration(6)
                .output(outputVideoPath)
                .on('end', resolve)
                .on('error', reject)
                .run();
        });

        return NextResponse.json({ trimmedVideo: '/uploads/trimmed/trimmed-video.mp4' });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to trim video' }, { status: 500 });
    }
}