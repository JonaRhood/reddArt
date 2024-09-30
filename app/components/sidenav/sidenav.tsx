"use client";

import styles from '@/public/styles/sidenav.module.css'

import ArtReddits from "./artReddits";
import CustomIcon from '@/app/lib/resources/CustomIcon'
import Link from "next/link";
import { useAppDispatch } from "@/app/lib/hooks";
import { setSelectedSubReddit, resetGallery } from "@/app/lib/features/gallery/gallerySlice";
import { Suspense } from 'react';
import { useAppSelector } from '@/app/lib/hooks';
import { RootState } from '@/app/lib/store';


export default function Sidenav() {
    const isMobile = useAppSelector((state: RootState) => state.mobile.isMobile);
    const clickedNav = useAppSelector((state: RootState) => state.mobile.clickedNav);
    const dispatch = useAppDispatch();

    const handleLinkClick = (e: any) => {
        e.stopPropagation();
        dispatch(resetGallery());
    }

    return (
        <div>
            <div>
                <Link href={`/`} onClick={((e) => handleLinkClick(e))}>
                    <div className={`
                    ${styles.title}
                    flex sm:hidden w-full sm:w-80 items-center bg-light-surface p-2 h-14 fixed top-0 left-0 right-0 z-50 
                    `}>
                        <CustomIcon className="w-12 h-12 text-[#ff4500]" />
                        <h1 className={`${styles.hache}text-center font-bold text-3xl`}>
                            <span className="text-[#ff4500]">redd</span>
                            <span className={styles.gradientText}>Art</span>
                        </h1>
                    </div>
                </Link>
            </div>
            <div
                className={`flex flex-col t-8 w-full z-0 bg-light-surface mt-14 sm:mt-0 h-screen fixed sm:w-80 ${clickedNav ? styles.navClicked : ""}`}
                style={{
                    transition: 'transform 1s ease'
                }}
            >
                <Link href={`/`} onClick={((e) => handleLinkClick(e))}>
                    <div className={`
                    ${styles.title}
                    hidden sm:flex w-full sm:w-80 items-center justify-center bg-light-surface p-2 h-24 fixed top-0 left-0 right-0
                    `}>
                        <CustomIcon className="w-12 h-12 text-[#ff4500]" />
                        <h1 className={`${styles.hache}text-center font-bold text-3xl`}>
                            <span className="text-[#ff4500]">redd</span>
                            <span className={styles.gradientText}>Art</span>
                        </h1>
                    </div>
                </Link>
                <div className="pt-0 sm:pt-24 overflow-hidden overflow-scroll overflow-x-hidden border-2">
                    <Suspense fallback={null}>
                        <ArtReddits />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
