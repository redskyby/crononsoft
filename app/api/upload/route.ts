import { promises as fs } from "fs";
import path from "path";

import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { ErrorInterface } from "@/interface/Error.interface";
import { UploadInterface } from "@/interface/Upload.interface";

export async function POST(req: Request): Promise<NextResponse<UploadInterface | ErrorInterface>> {
    try {
        const formData = await req.formData();
        const file = formData.get("video") as File;

        if (!file || !(file instanceof File)) {
            return NextResponse.json({ error: "Файл обязателен" }, { status: 400 });
        }

        if (file.type !== "video/mp4") {
            return NextResponse.json({ error: "Допускаются только .mp4 файлы" }, { status: 400 });
        }

        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await fs.mkdir(uploadDir, { recursive: true });

        const uniqueFileName = `${uuidv4()}${`.mp4`}`;

        const filePath = path.join(uploadDir, uniqueFileName);

        const fileBuffer = Buffer.from(await file.arrayBuffer());

        await fs.writeFile(filePath, fileBuffer);

        return NextResponse.json({ uniqueFileName });
    } catch (e) {
        console.error("Ошибка", e);
        return NextResponse.json({ error: "Ошибка" }, { status: 400 });
    }
}
