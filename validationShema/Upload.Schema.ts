import * as Yup from "yup";

export const UploadSchema = Yup.object().shape({
    video: Yup.mixed()
        .required("Файл обязателен")
        .test("fileType", "Только .mp4", (value: File | null) => {
            return value && value.type === "video/mp4";
        }),
});
