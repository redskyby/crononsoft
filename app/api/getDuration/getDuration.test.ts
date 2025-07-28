import { POST } from "./route";
import { access } from "fs/promises";
import ffmpeg from "fluent-ffmpeg";
jest.mock("fs/promises", () => ({
    mkdir: jest.fn(() => Promise.resolve()),
    access: jest.fn(() => Promise.resolve()),
}));

jest.mock("uuid", () => ({
    v4: jest.fn(() => "test-uuid"),
}));

jest.mock("fluent-ffmpeg", () => {
    const ffmpegMock = jest.fn() as jest.Mock & {
        ffprobe: jest.Mock;
        setFfmpegPath: jest.Mock;
    };

    ffmpegMock.ffprobe = jest.fn((path: string, cb: Function) => {
        cb(null, { format: { duration: 42.5 } });
    });

    ffmpegMock.setFfmpegPath = jest.fn();

    return ffmpegMock;
});

describe("POST /api/getDuration", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return 400 if videoName is missed", async () => {
        const mockReg = {
            json: async () => ({
                videoName: null,
            }),
        } as Request;

        const res = await POST(mockReg);

        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data).toEqual({ error: "Missing videoName" });
    });

    it("should return 404 Video file not found", async () => {
        (access as jest.Mock).mockRejectedValueOnce(new Error("File not found"));

        const mockReg = {
            json: async () => ({
                videoName: "notFoundName.mp4",
            }),
        } as Request;

        const res = await POST(mockReg);
        const data = await res.json();

        expect(res.status).toBe(404);
        expect(data).toEqual({ error: "Video file not found" });
    });

    it("should return duration", async () => {
        const mockReg = {
            json: async () => ({
                videoName: "test.mp4",
            }),
        } as Request;

        const res = await POST(mockReg);

        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data).toEqual({ duration: 42.5 });
    });

    it("should return Error : Duration not found in metadata", async () => {
        (ffmpeg.ffprobe as jest.Mock).mockImplementation((path: string, cb: Function) => {
            cb(null, { format: {} });
        });

        const mockReg = {
            json: async () => ({
                videoName: "test.mp4",
            }),
        } as Request;

        const res = await POST(mockReg);

        const data = await res.json();

        expect(res.status).toBe(500);
        expect(data).toEqual({ error: "Failed to get video duration" });
    });
});
