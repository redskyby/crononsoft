import { POST } from "./route";
import type { Mock } from "jest-mock";

jest.mock("uuid", () => ({
    v4: jest.fn(() => "test-uuid"),
}));

jest.mock("fs/promises", () => ({
    mkdir: jest.fn(() => Promise.resolve()),
    readdir: jest.fn(() => Promise.resolve()),
}));

jest.mock("fluent-ffmpeg", () => {
    const ffmpegMock = jest.fn(() => {
        on: jest.fn(function (event: any, cd: Function) {
            if (event === "filenames") cd();
            return this;
        });
        screenshots: jest.fn((cd: Function) => {
            cd(null, {
                count: 10,
                folder: "testFolder",
                filename: "${uniquePrefix}-%i.jpg",
                size: "160x90",
            });
            return this;
        });
    }) as jest.Mock & {
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
});
