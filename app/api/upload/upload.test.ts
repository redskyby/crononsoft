import { POST } from "./route";

jest.mock("uuid", () => ({
    v4: jest.fn(() => "mocked-uuid"),
}));

jest.mock("fs/promises", () => ({
    mkdir: jest.fn(() => Promise.resolve()),
    writeFile: jest.fn(() => Promise.resolve()),
}));

describe("upload route", () => {
    it("should return error : Файл обязателен", async () => {
        const mockReq = {
            formData: async () => ({
                get: () => null,
            }),
        } as unknown as Request;

        const res = await POST(mockReq);

        const data = await res.json();
        expect(res.status).toBe(400);
        expect(data).toEqual({ error: "Файл обязателен" });
    });

    it("should return error : Допускаются только .mp4 файлы", async () => {
        const mockFile = new File(["dummy"], "badfile.txt", {
            type: "application/octet-stream",
        });

        const mockReq = {
            formData: async () => ({
                get: () => mockFile,
            }),
        } as unknown as Request;

        const res = await POST(mockReq);

        const data = await res.json();
        expect(res.status).toBe(400);
        expect(data).toEqual({ error: "Допускаются только .mp4 файлы" });
    });

    it("should return good answer with status code 200", async () => {
        const mockFile = new File(["dummy"], "badfile.mp4", {
            type: "video/mp4",
        });

        const mockReq = {
            formData: async () => ({
                get: () => mockFile,
            }),
        } as unknown as Request;

        const res = await POST(mockReq);

        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data).toHaveProperty("uniqueFileName");
    });
});
