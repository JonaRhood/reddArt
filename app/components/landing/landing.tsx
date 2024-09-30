"use client"

import Image from "next/image"
import mockup from "@/public/mockup3.jpg"
import { useInView } from "react-intersection-observer"

import styles from "@/public/styles/landing.module.css"

export default function Landing() {

    const { ref, inView } = useInView({
        triggerOnce: true,
    })

    return (
        <>
            <div className={`flex bg-light-background h-screen justify-center w-screen`}>
                <div className="flex ml-56 sm:ml-80 w-full justify-center overflow-hidden p-8">
                    <div className={`flex w-full bg-gray-300 rounded-3xl border-8 border-white shadow-xl ${styles.landingBackgroundBlur}`}>
                    <Image
                        ref={ref}
                        src={mockup}
                        alt="Macbook Pro mockup with landing page"
                        width={550}
                        height={300}
                        className={`${styles.landingImage} rounded-2xl`}
                        priority={true}
                        placeholder="blur"
                        style={{
                            opacity: inView ? 1 : 0,
                            transition: 'opacity 0.2s cubic-bezier(0.3, 0.2, 0.2, 0.8)'
                        }}
                    />
                    </div>
                </div>
            </div>
        </>
    )
};