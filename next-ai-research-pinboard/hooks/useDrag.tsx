import { MutableRefObject, useEffect, useState } from "react";

export default function useDrag(
    scrollRef: MutableRefObject<HTMLDivElement | null>
) {
    const [isDragging, setIsDragging] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [scrollPos, setScrollPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const scroll = scrollRef.current;
        const handleMouseDown = (event: MouseEvent) => {
            if (!scroll) return;
            setIsDragging(true);
            setMousePos({ x: event.clientX, y: event.clientY });
            setScrollPos({
                x: scroll.scrollLeft,
                y: scroll.scrollTop,
            });
        };

        const handleMouseMove = (event: MouseEvent) => {
            if (!isDragging || !scroll) return;
            const dx = event.clientX - mousePos.x;
            const dy = event.clientY - mousePos.y;
            scroll.scrollLeft = scrollPos.x - dx;
            scroll.scrollTop = scrollPos.y - dy;
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (!scroll) return;
        scroll.addEventListener("mousedown", handleMouseDown);
        scroll.addEventListener("mousemove", handleMouseMove);
        scroll.addEventListener("mouseup", handleMouseUp);
        return () => {
            scroll.removeEventListener("mousedown", handleMouseDown);
            scroll.removeEventListener("mousemove", handleMouseMove);
            scroll.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging, mousePos, scrollPos, scrollRef]);

    return { isDragging, mousePos, scrollPos };
}
