import React, { useEffect, useRef, useState } from "react";
import noUiSlider from "nouislider";
import "nouislider/dist/nouislider.css";
import Spinner from "@/components/Spinner";

const VideoRange = ({duration , videoName} : {duration : number , videoName : string}) => {
    const sliderRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);
    const [start, setStart] = useState<number>(0);
    const [end, setEnd] = useState<number>(0);

    console.log("duration" , duration );


    const handleCut = async (videoName : string , start : number , end : number) => {
        try {
            setLoading(true);
            const res = await fetch('/api/videoedit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoName  , start ,end  }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Ошибка при загрузке превью');
            }

            const data = await res.json();
        } catch (e: any) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!sliderRef.current) return;

        const slider = sliderRef.current;

        noUiSlider.create(slider, {
            start: [0, 80],
            connect: true,
            range: {
                min: 0,
                max: duration ,
            },
            step: 0.01,
        });

        // Подписка на события изменения
        // @ts-ignore
        slider.noUiSlider?.on("update", (values, handle) => {
            const start =  +parseFloat(values[0]).toFixed(2);
            const end = +parseFloat(values[1]).toFixed(2);
            setStart(start)
            setEnd(end)
            console.log("Start:", start, "End:", end);
        });

        return () => {
            // @ts-ignore
            slider.noUiSlider?.destroy();
        };
    }, []);

    const updateSlider = (newStart: number, newEnd: number) => {
        const slider = sliderRef.current;
        // @ts-ignore
        if (slider?.noUiSlider) {
            // @ts-ignore
            slider.noUiSlider.set([newStart, newEnd]);
        }
    };

    if (loading) {
        return <Spinner />;
    }


    return (
        <div>
            <div ref={sliderRef} />
            <div className="flex items-center gap-4">
                <div>
                    <label className="block text-sm font-medium">Start (сек)</label>
                    <input
                        type="number"
                        min={0}
                        max={end}
                        step={0.01}
                        value={start}
                        onChange={(e) => {
                            const val = Math.min(Math.max(0, parseFloat(e.target.value)), end);
                            setStart(val);
                            updateSlider(val, end);
                        }}
                        className="border rounded px-2 py-1 w-24"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">End (сек)</label>
                    <input
                        type="number"
                        min={start}
                        max={duration}
                        step={0.01}
                        value={end}
                        onChange={(e) => {
                            const val = Math.max(Math.min(parseFloat(e.target.value), duration), start);
                            setEnd(val);
                            updateSlider(start, val);
                        }}
                        className="border rounded px-2 py-1 w-24"
                    />
                </div>
            </div>

            <button onClick={() => handleCut(videoName, start, end)}>
                скачать обрезанную версию
            </button>
        </div>
    );
};

export default VideoRange;