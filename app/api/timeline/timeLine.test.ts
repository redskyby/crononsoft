import { POST } from "./route";
import { Null } from "@sinclair/typebox";

jest.mock("uuid", () => ({
    v4: jest.fn(() => "mocked-uuid"),
}));

jest.mock("fs/promises", () => ({
    mkdir: jest.fn(() => Promise.resolve()),
    readdir: jest.fn(() => Promise.resolve([])),
    unlink: jest.fn(() => Promise.resolve()),
}));

jest.mock("fluent-ffmpeg", () => {
    const ffmpegMock = jest.fn(() => ({
        on: jest.fn(function (event: any, cd: Function) {
            if (event === "filenames")
                cd(Array.from({ length: 10 }, (_, i) => `/uploads/frames/mocked-uuid-${i + 1}.jpg`));
            if (event === "end") cd();
            return this;
        }),
        screenshots: jest.fn((cd: Function) => {
            cd(null, {
                count: 10,
                folder: "testFolder",
                filename: "${uniquePrefix}-%i.jpg",
                size: "160x90",
            });
            return this;
        }),
    })) as jest.Mock & {
        setFfmpegPath: jest.Mock;
    };
    ffmpegMock.setFfmpegPath = jest.fn();

    return ffmpegMock;
});

describe("POST /api/timeLine", () => {
    it("return 400 Missing or invalid videoName", async () => {
        const mockReq = {
            json: async () => ({ videoName: null }),
        } as Request;

        const res = await POST(mockReq);

        const data = await res.json();
        expect(res.status).toBe(400);
        expect(data).toEqual({ error: "Missing or invalid videoName" });
    });

    it("should return timeLines", async () => {
        const mockReg = {
            json: async () => ({
                videoName: "test",
                videoPath: "test",
            }),
        } as Request;

        const res = await POST(mockReg);

        const data = await res.json();
        expect(res.status).toBe(200);
        expect(data).toEqual({
            thumbnails: Array.from({ length: 10 }, (_, i) => `/uploads/frames/mocked-uuid-${i + 1}.jpg`),
        });
    });

    it("should return error in on", async () => {
        const ffmpeg = require("fluent-ffmpeg");
        ffmpeg.mockImplementation(() => ({
            on: function (event: any, cd: Function) {
                if (event === "error") {
                    cd(new Error("FFmpeg error"));
                }
                return this;
            },
            screenshots: jest.fn(),
        }));

        const mockReg = {
            json: async () => ({
                videoName: "test",
                videoPath: "test",
            }),
        } as Request;

        const res = await POST(mockReg);

        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data).toEqual({ error: "FFmpeg error" });
    });
});
