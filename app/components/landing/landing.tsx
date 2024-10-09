"use client"

import Image from "next/image"
import mockup from "@/public/mockup3.jpg"
import { useInView } from "react-intersection-observer"
import { useAppSelector } from "@/app/lib/hooks"
import { RootState } from "@/app/lib/store"
import { useEffect } from "react"
import { useAppDispatch } from "@/app/lib/hooks"
import { setDarkTheme } from "@/app/lib/features/theme/themeSlice"

import styles from "@/public/styles/landing.module.css"

export default function Landing() {

    const isDarkTheme = useAppSelector((state: RootState) => state.theme.isDarkTheme);
    const dispatch = useAppDispatch();

    const { ref, inView } = useInView({
        triggerOnce: true,
    })

    return (
        <>
            <div className={`flex justify-center w-screen`} style={{ height: "100dvh" }}>
                <div className="flex ml-0 sm:ml-80 w-full justify-center overflow-hidden mt-16 sm:mt-0 p-2 sm:p-8">
                    <div className={`
                        flex relative w-full bg-gray-300 rounded-3xl border-8 shadow-sm sm:shadow-xl ${styles.landingBackgroundBlur}
                        ${isDarkTheme ? "border-gray-700 transition-colors duration-500" : "border-white transition-colors duration-500"}
                        `}>

                        <Image
                            ref={ref}
                            src={mockup}
                            alt="Macbook Pro mockup with landing page"
                            className={`${styles.landingImage} rounded-2xl`}
                            priority={true}
                            loading="eager"
                            placeholder="blur"
                            fill
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