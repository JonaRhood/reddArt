"use client";

import styles from '@/public/styles/sidenav.module.css'

import ArtReddits from "./artReddits";
import CustomIcon from '@/app/lib/resources/CustomIcon'
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import Link from "next/link";
import { useAppDispatch } from "@/app/lib/hooks";
import { setSelectedSubReddit, resetGallery } from "@/app/lib/features/gallery/gallerySlice";
import { Suspense } from 'react';
import { useAppSelector } from '@/app/lib/hooks';
import { RootState } from '@/app/lib/store';
import { setClickedNav } from '@/app/lib/features/mobileSlice/mobileSlice';


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
                <div className={`
                    ${styles.title}
                    flex sm:hidden w-full sm:w-80 items-center bg-light-surface p-2 h-14 fixed top-0 left-0 right-0 z-50 
                    `}>
                    <Link
                        href={`/`}
                        onClick={((e) => {
                            handleLinkClick(e);
                            dispatch(setClickedNav(false));
                        })}>
                        <div className='flex items-center'>
                            <CustomIcon className="w-12 h-12 text-[#ff4500]" />
                            <h1 className={`${styles.hache}text-center font-bold text-3xl`}>
                                <span className="text-[#ff4500]">redd</span>
                                <span className={styles.gradientText}>Art</span>
                            </h1>
                        </div>
                    </Link>
                </div>
            </div>
            <div
                className={`flex flex-col t-8 w-full z-0 bg-light-surface mt-14 sm:mt-0 h-screen fixed sm:w-80 ${clickedNav ? styles.navUnClicked : styles.navClicked}`}
                style={{
                    transition: 'transform 1s ease'
                }}
            >
                <div className={`
                    ${styles.title}
                    hidden sm:flex w-full sm:w-80 items-center justify-center bg-light-surface p-2 h-24 fixed top-0 left-0 right-0 z-50
                    `}>
                    <Link href={`/`} onClick={((e) => handleLinkClick(e))}>
                        <div className='flex items-center'>
                            <CustomIcon className="w-12 h-12 text-[#ff4500]" />
                            <h1 className={`${styles.hache} text-center font-bold text-3xl`}>
                                <span className="text-[#ff4500]">redd</span>
                                <span className={styles.gradientText}>Art</span>
                            </h1>
                        </div>
                    </Link>
                </div>
                <div className="pt-0 sm:pt-24 overflow-hidden overflow-scroll overflow-x-hidden border-2">
                    <Suspense fallback={null}>
                        <ArtReddits />
                    </Suspense>
                </div>
                <div
                    className='flex sm:hidden h-4 w-full bg-gray-500 bg-opacity-5 justify-center hover:cursor-pointer hover:bg-light-primary/20 items-center'
                    onClick={(e) => dispatch(setClickedNav(true))}
                >
                    <div className={`flex`}>
                        <ChevronDownIcon className="size-4" />
                    </div>
                </div>
            </div>
        </div>
    );
}
