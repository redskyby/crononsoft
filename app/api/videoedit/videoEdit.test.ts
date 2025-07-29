import { POST } from "./route";

jest.mock("uuid", () => ({
    v4: jest.fn(() => "test-uuid"),
}));

jest.mock("fs/promises", () => ({
    mkdir: jest.fn(() => Promise.resolve()),
}));

jest.mock("fluent-ffmpeg", () => {
    const ffmpegMock = jest.fn(() => ({
        setStartTime: jest.fn().mockReturnThis(),
        setDuration: jest.fn().mockReturnThis(),
        output: jest.fn().mockReturnThis(),
        on: jest.fn(function (event, cd: Function) {
            if (event === "end") cd();
            return this;
        }),
        run: jest.fn().mockReturnThis(),
    }));
    // @ts-ignore
    ffmpegMock.setFfmpegPath = jest.fn();
    return ffmpegMock;
});

describe("POST /api/videoEdit", () => {
    it("return 400 if required fields are missing", async () => {
        const mockReq = {
            json: async () => ({ videoName: null, start: 0, end: 10 }),
        } as Request;

        const res = await POST(mockReq);

        const data = await res.json();
        expect(res.status).toBe(400);
        expect(data).toEqual({ error: "Missing required fields" });
    });

    it("return 200 and trimmed video path on success", async () => {
        const mockReq = {
            json: async () => ({ videoName: "test.mp4", start: 0, end: 10 }),
        } as Request;

        const res = await POST(mockReq);

        const data = await res.json();
        expect(res.status).toBe(200);
        expect(data).toEqual({ trimmedVideo: "/uploads/trimmed/trimmed-video.mp4" });
    });

    it("returns 500 on ffmpeg error", async () => {
        // Подменим ffmpeg поведение, чтобы оно вызвало ошибку
        const ffmpeg = require("fluent-ffmpeg");
        ffmpeg.mockImplementation(() => ({
            setStartTime: jest.fn().mockReturnThis(),
            setDuration: jest.fn().mockReturnThis(),
            output: jest.fn().mockReturnThis(),
            on: function (event: any, callback: Function) {
                if (event === "error") callback(new Error("FFmpeg error"));
                return this;
            },
            run: jest.fn(),
        }));

        const mockReq = {
            json: async () => ({ videoName: "test.mp4", start: 0, end: 10 }),
        } as Request;

        const res = await POST(mockReq);

        const data = await res.json();
        expect(res.status).toBe(500);
        expect(data).toEqual({ error: "Failed to trim video" });
    });
});
