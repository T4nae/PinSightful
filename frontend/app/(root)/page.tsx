"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { MoveRight } from "lucide-react";

import { Highlight } from "@/components/ui/hero-highlight";
import { TypewriterEffectSmooth } from "@/components/ui/typewritter-effect";
import {
    GlowingStarsBackgroundCard,
    GlowingStarsDescription,
    GlowingStarsTitle,
} from "@/components/ui/glowing-stars";

export default function Home() {
    const Router = useRouter();
    const words = [
        {
            text: "Research",
        },
        {
            text: ", Develop",
        },
        {
            text: "& Innovate",
        },
        {
            text: "with",
        },
        {
            text: "PinSightful.",
            className: "text-purple-500 dark:text-purple-500",
        },
    ];
    return (
        <>
            <div
                id="home"
                className="flex h-[100vh] w-full justify-center items-center"
            >
                <motion.h1
                    initial={{
                        opacity: 0,
                        y: 20,
                    }}
                    animate={{
                        opacity: 1,
                        y: [20, -5, 0],
                    }}
                    transition={{
                        duration: 0.5,
                        ease: [0.4, 0.0, 0.2, 1],
                    }}
                    className="text-2xl px-4 md:text-4xl lg:text-5xl font-bold text-neutral-700 dark:text-white max-w-4xl leading-relaxed lg:leading-snug text-center mx-auto "
                >
                    <Highlight className="text-3xl lg:text-8xl text-black dark:text-white">
                        PinSightful:
                    </Highlight>
                    AI-Enhanced Pinboards for Insightful Research
                </motion.h1>
            </div>
            <div
                id="get-started"
                className="flex flex-col h-[100vh] w-full justify-center items-center"
            >
                <TypewriterEffectSmooth
                    words={words}
                    className="hidden md:flex"
                />
                <TypewriterEffectSmooth
                    words={[words[0], words[1], words[2]]}
                    className="md:hidden flex"
                />
                <TypewriterEffectSmooth
                    words={[words[3], words[4]]}
                    className="md:hidden flex"
                />
                <div className="relative md:flex justify-evenly w-full mt-10">
                    <div
                        className="flex py-5 items-center justify-center antialiased"
                        onClick={() => Router.push("/dashboard")}
                    >
                        <GlowingStarsBackgroundCard>
                            <GlowingStarsTitle>Get Started</GlowingStarsTitle>
                            <div className="flex justify-between items-end">
                                <GlowingStarsDescription>
                                    Harness the power of AI to enhance your
                                    research now
                                </GlowingStarsDescription>
                                <div className="h-8 w-8 rounded-full bg-[hsla(0,0%,92%,.8)] dark:bg-[hsla(0,0%,100%,.1)] flex items-center justify-center">
                                    <MoveRight />
                                </div>
                            </div>
                        </GlowingStarsBackgroundCard>
                    </div>
                    <div
                        className="flex py-5 items-center justify-center antialiased"
                        onClick={() =>
                            window.open("https://www.tanyambaweja.tech/")
                        }
                    >
                        <GlowingStarsBackgroundCard>
                            <GlowingStarsTitle>About Me</GlowingStarsTitle>
                            <div className="flex justify-between items-end">
                                <GlowingStarsDescription>
                                    Learn more about the developer behind
                                    PinSightful
                                </GlowingStarsDescription>
                                <div className="h-8 w-8 rounded-full bg-[hsla(0,0%,92%,.8)] dark:bg-[hsla(0,0%,100%,.1)] flex items-center justify-center">
                                    <MoveRight />
                                </div>
                            </div>
                        </GlowingStarsBackgroundCard>
                    </div>
                </div>
            </div>
        </>
    );
}
