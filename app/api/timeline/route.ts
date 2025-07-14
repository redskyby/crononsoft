import { NextResponse } from 'next/server';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';

// const FFMPEG_PATH = '/usr/bin/ffmpeg'; // путь к ffmpeg в WSL
// ffmpeg.setFfmpegPath(FFMPEG_PATH);

ffmpeg.setFfmpegPath('ffmpeg');

export async function POST(req: Request) {
    try {
        const {videoName} = await req.json();

        const videoPath = `D:\\development\\crononsoft\\public\\uploads\\${videoName}`;
        const outputDir = `D:\\development\\crononsoft\\public\\uploads\\frames`;

        await fs.mkdir(outputDir, { recursive: true });

        const prefix = Date.now();

        return new Promise((resolve, reject) => {
            ffmpeg(videoPath)
                .on('filenames', (filenames) => {
                    console.log('Generated thumbnails:', filenames);
                })
                .on('end', () => {
                    const thumbnails = [];
                    for (let i = 1; i <= 10; i++) {
                        thumbnails.push(`/uploads/frames/${prefix}-${i}.jpg`);
                    }
                    resolve(NextResponse.json({ thumbnails }));
                })
                .on('error', (err) => {
                    console.error('FFmpeg error:', err);
                    reject(NextResponse.json({ error: 'FFmpeg failed' }, { status: 500 }));
                })
                .screenshots({
                    count: 10,
                    folder: outputDir,
                    filename: `${prefix}-%i.jpg`,
                    size: '160x90',
                });
        });
    } catch (e) {
        console.error('Unexpected error:', e);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}