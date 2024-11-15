import { pin, content } from "@/actions/pin";
import { MutableRefObject } from "react";

export const drawPins = (
    pins: pin[],
    zoomFactor: MutableRefObject<number>,
    ctx: CanvasRenderingContext2D,
    theme: string | undefined,
    embeds: { _id: string; embed: string; x: number; y: number }[],
    setEmbeds: (
        embeds: {
            _id: string;
            embed: string;
            x: number;
            y: number;
        }[]
    ) => void
) => {
    if (!pins) return;
    pins.forEach((pin) => {
        // create a rectangle shape at the pin position
        const posX = (pin.pos.x - 100) * zoomFactor.current;
        const posY = (pin.pos.y - 300 / 2) * zoomFactor.current;
        const width = 300 * zoomFactor.current;
        const maxCharactersPerLine = 35;

        let lines: string[] = [];
        if (pin.texts) {
            for (let i = 0; i < pin.texts.length; i++) {
                let text: string = (pin.texts[i] as content).text! || "";
                let startIndex = 0;
                let endIndex = maxCharactersPerLine;

                let yPos = posY;

                while (startIndex < text.length) {
                    yPos += 16 * zoomFactor.current + 1; // Adjust lineHeight as needed

                    // Find the nearest space or punctuation mark to end the line
                    while (
                        endIndex < text.length &&
                        !/[ .!?,;:-]/.test(text.charAt(endIndex))
                    ) {
                        endIndex--;
                    }

                    // If no suitable breaking point is found, break the word
                    if (endIndex === startIndex) {
                        endIndex = startIndex + maxCharactersPerLine;
                    }

                    // Extract the line
                    const line = text.substring(startIndex, endIndex);

                    // Add the line to the lines array
                    lines.push(line);

                    // Move to the next line

                    // Update start index for the next line
                    startIndex = endIndex;

                    // Skip leading whitespace's for the next line
                    while (
                        startIndex < text.length &&
                        /[ .!?,;:-]/.test(text.charAt(startIndex))
                    ) {
                        startIndex++;
                    }

                    // Update end index for the next line
                    endIndex = Math.min(
                        startIndex + maxCharactersPerLine,
                        text.length
                    );
                }
            }
        }

        pin.height =
            lines.length > 0 || (pin.videos && pin.videos.length > 0)
                ? lines.length * 16 * zoomFactor.current +
                  1 +
                  (pin.videos!.length * 158 + 10 * zoomFactor.current) +
                  10
                : 300 * zoomFactor.current + 5;

        ctx.fillStyle = theme == "light" ? "#fff" : "#000";
        ctx.beginPath();
        ctx.roundRect(posX, posY, width, pin.height, 10 * zoomFactor.current);
        ctx.strokeStyle = theme == "light" ? "#f1f1f1" : "#333";
        ctx.lineWidth = 2 * zoomFactor.current;
        ctx.stroke();
        ctx.fill();

        // draw the pin text
        if (!lines) return;

        ctx.fillStyle = theme == "light" ? "#000" : "#fff";
        ctx.font = `${16 * zoomFactor.current}px Arial`;
        ctx.textAlign = "center";

        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(
                lines[i],
                posX + width / 2,
                posY + 16 * zoomFactor.current + i * 16 * zoomFactor.current
            );
        }

        if (!pin.videos) return;

        for (let i = 0; i < pin.videos.length; i++) {
            const img = (pin.videos[i] as content).image!;
            if (img === null) return;
            // check if image is loaded and and not broken
            if (!img.complete || img.naturalWidth === 0)
                img.onload = () => {
                    ctx.drawImage(
                        img,
                        posX + 10 * zoomFactor.current,
                        posY +
                            16 * lines.length * zoomFactor.current +
                            i * 158 * zoomFactor.current +
                            10,
                        280 * zoomFactor.current,
                        158 * zoomFactor.current
                    );
                };
            else
                ctx.drawImage(
                    img,
                    posX + 10 * zoomFactor.current,
                    posY +
                        16 * lines.length * zoomFactor.current +
                        i * 158 * zoomFactor.current +
                        10,
                    280 * zoomFactor.current,
                    158 * zoomFactor.current
                );

            if ((pin.videos[i] as content).type === "video") {
                const redirect = pin.videos[i] as content;
                var embed = embeds.find((embed) => embed._id === redirect._id);

                if (!embed) {
                    setEmbeds([
                        ...embeds,
                        {
                            _id: redirect._id,
                            embed: redirect.redirect!,
                            x: posX + 10 * zoomFactor.current,
                            y:
                                posY +
                                16 * lines.length * zoomFactor.current +
                                i * 158 * zoomFactor.current +
                                10,
                        },
                    ]);
                } else {
                    // update the embed position with zoom factor
                    const updatedEmbeds = embeds.map((e) => {
                        if (embed && e._id === embed._id) {
                            return {
                                ...e,
                                x: posX + 10 * zoomFactor.current,
                                y:
                                    posY +
                                    16 * lines.length * zoomFactor.current +
                                    i * 158 * zoomFactor.current +
                                    10,
                            };
                        }
                        return e;
                    });

                    // update the embeds state if there is a change
                    if (
                        JSON.stringify(updatedEmbeds) !== JSON.stringify(embeds)
                    ) {
                        setEmbeds(updatedEmbeds);
                    }
                }

                // draw share icon on the corner of the video
                ctx.beginPath();
                ctx.moveTo(
                    posX + 10 * zoomFactor.current,
                    posY +
                        16 * lines.length * zoomFactor.current +
                        i * 158 * zoomFactor.current +
                        10
                );
                ctx.lineTo(
                    posX + 10 * zoomFactor.current + 20,
                    posY +
                        16 * lines.length * zoomFactor.current +
                        i * 158 * zoomFactor.current +
                        10
                );
                ctx.lineTo(
                    posX + 10 * zoomFactor.current,
                    posY +
                        16 * lines.length * zoomFactor.current +
                        i * 158 * zoomFactor.current +
                        30
                );
                ctx.closePath();

                ctx.fillStyle = theme == "light" ? "#000" : "#fff";
                ctx.fill();
            }
        }
    });
};

export const updatePattern = (
    zoomFactor: MutableRefObject<number>,
    theme: string | undefined,
    patternRef: MutableRefObject<CanvasPattern | null>,
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
) => {
    const patternCanvas = document.createElement("canvas");
    const patternCanvasWidth = 20 * zoomFactor.current;
    const patternCanvasHeight = 20 * zoomFactor.current;
    patternCanvas.width = patternCanvasWidth;
    patternCanvas.height = patternCanvasHeight;
    const patternCtx = patternCanvas.getContext("2d");
    if (!patternCtx) return;

    // Off-white background
    patternCtx.fillStyle = theme == "light" ? "#F8F8F8" : "#0F0F0F";
    patternCtx.fillRect(0, 0, patternCanvasWidth, patternCanvasHeight);

    // Small dots (scaled)
    patternCtx.fillStyle = theme == "light" ? "#D3D3D3" : "#333";
    patternCtx.fillRect(0, 0, 2 * zoomFactor.current, 2 * zoomFactor.current);
    patternCtx.fillRect(
        10 * zoomFactor.current,
        10 * zoomFactor.current,
        2 * zoomFactor.current,
        2 * zoomFactor.current
    );

    patternRef.current = ctx.createPattern(patternCanvas, "repeat");

    // Fill the canvas with the pattern
    if (patternRef.current) {
        ctx.fillStyle = patternRef.current;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
};
