export interface TimelineProps {
    videoName: string;
    currentTime: number;
    duration: number;
    onSeek: (time: number) => void;
}
