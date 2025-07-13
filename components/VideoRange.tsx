import React, { useEffect, useRef } from "react";
import noUiSlider from "nouislider";
import "nouislider/dist/nouislider.css";

const VideoRange = () => {
    const sliderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sliderRef.current) return;

        const slider = sliderRef.current;

        noUiSlider.create(slider, {
            start: [20, 80],
            connect: true,
            range: {
                min: 0,
                max: 100,
            },
            step: 1,
        });

        // Подписка на события изменения
        // @ts-ignore
        slider.noUiSlider?.on("update", (values, handle) => {
            const start = Math.round(Number(values[0]));
            const end = Math.round(Number(values[1]));
            console.log("Start:", start, "End:", end);
        });

        return () => {
            // @ts-ignore
            slider.noUiSlider?.destroy();
        };
    }, []);

    return <div ref={sliderRef} />;
};

export default VideoRange;