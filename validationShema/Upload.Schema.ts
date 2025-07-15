import * as Yup from "yup";

export const UploadSchema = Yup.object().shape({
    video: Yup.mixed<File>()
        .required("Файл обязателен")
        .test("fileType", "Только .mp4", (value) => {
            return value && value.type === "video/mp4";
        }),
});
