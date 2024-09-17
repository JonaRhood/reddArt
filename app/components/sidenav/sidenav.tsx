"use client";

import styles from '@/app/styles/sidenav.module.css'

import ArtReddits from "./artReddits";
import CustomIcon from '@/app/lib/resources/CustomIcon'
import Link from "next/link";
import { useAppDispatch } from "@/app/lib/hooks";
import { setSelectedSubReddit, resetGallery } from "@/app/lib/features/gallery/gallerySlice";


export default function Sidenav() {
    const dispatch = useAppDispatch();

    const handleLinkClick = () => {
        dispatch(resetGallery());
        dispatch(setSelectedSubReddit(null));
    }
    
    return (
        <div className="flex flex-col w-56 z-50 bg-light-surface h-screen overflow-hidden fixed sm:w-80">
            <Link href={`/`} onClick={(() => handleLinkClick())}>
                <div className={`
                    ${styles.title}
                    flex w-56 sm:w-80 items-center justify-center bg-light-surface p-2 h-24 fixed top-0 left-0 right-0 z-10
                `}>
                    <CustomIcon className="w-12 h-12 text-[#ff4500]" />
                    <h1 className="text-center font-bold text-3xl">
                        <span className="text-[#ff4500]">redd</span>
                        <span className="text-gradient">Art</span>
                    </h1>
                </div>
            </Link>
            <div className="pt-24 overflow-hidden overflow-scroll overflow-x-hidden">
                <ArtReddits />
            </div>
        </div>
    );
}
