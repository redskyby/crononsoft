import { promises as fs } from "fs";
import path from "path";

import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("video") as File;

        const uploadDir = path.join(process.cwd(), "uploadfolder");
        await fs.mkdir(uploadDir, { recursive: true });

        const uniqueFileName = `${uuidv4()}${`.mp4`}`;

        const filePath = path.join(uploadDir, uniqueFileName);

        const fileBuffer = Buffer.from(await file.arrayBuffer());

        await fs.writeFile(filePath, fileBuffer);

        return NextResponse.json({ message: "works" });
    } catch (e) {
        console.error("Ошибка", e);
        return NextResponse.json({ error: "Ошибка" }, { status: 400 });
    }
}
