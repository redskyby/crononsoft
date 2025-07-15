"use client";
import { ClipLoader } from "react-spinners";

export default function Spinner() {
    return (
        <div className="flex justify-center items-center h-32">
            <ClipLoader color="#36d7b7" size={50} />
        </div>
    );
}
