"use client";

import styles from '@/public/styles/sidenav.module.css'

import ArtReddits from "./components/artReddits";
import RedditLogin from './components/RedditLogin';
import CustomIcon from '@/app/assets/lib/resources/CustomIcon'
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import Link from "next/link";
import { useAppDispatch } from "@/app/assets/store/hooks";
import { resetGallery } from "@/app/assets/store/slices/gallerySlice/gallerySlice";
import { Suspense } from 'react';
import { useAppSelector } from '@/app/assets/store/hooks';
import { RootState } from '@/app/assets/store/store';
import { setClickedNav } from '@/app/assets/store/slices/mobileSlice/mobileSlice';
import { login, logout } from '../../lib/utils/loginAuth';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';


export default function Sidenav() {
    const isMobile = useAppSelector((state: RootState) => state.mobile.isMobile);
    const clickedNav = useAppSelector((state: RootState) => state.mobile.clickedNav);
    const userClicked = useAppSelector((state: RootState) => state.mobile.userClicked);
    const isDarkTheme = useAppSelector((state: RootState) => state.theme.isDarkTheme);
    const isAuthorized = useAppSelector((state: RootState) => state.general.isAuthorized);
    const dispatch = useAppDispatch();

    const pathname = usePathname();

    
    const handleLinkClick = (e: any) => {
        e.stopPropagation();
        dispatch(resetGallery());
    }

    useEffect(() => {
        if (isAuthorized && pathname.length <= 1) {
            dispatch(setClickedNav(true));
        }
    }, [isAuthorized])

    return (
        <div className={userClicked ? "hidden" : ""}>

            {/* MOBILE HEADER */}
            <div>
                <div className={`
                    ${styles.title}
                    flex sm:hidden w-full justify-between sm:w-80 items-center p-2 h-14 fixed top-0 left-0 right-0 z-50 shadow-sm
                    ${isDarkTheme ? "bg-dark-surface" : "bg-light-surface"}
                    `}>
                    <Link
                        href={`/`}
                        onClick={((e) => {
                            handleLinkClick(e);
                            dispatch(setClickedNav(false));
                        })}>
                        <div className='flex items-center'>
                            <CustomIcon className={`w-12 h-12 transition-colors duration-500 ${isDarkTheme ? "text-white" : "text-[#ff4500]"}`} />
                            <h1 className={`${styles.hache}text-center font-bold text-3xl`}>
                                <span className={`transition-colors duration-500 ${isDarkTheme ? "text-white" : "text-[#ff4500]"}`}>redd</span>
                                <span className={styles.gradientText}>Art</span>
                            </h1>
                        </div>
                    </Link>
                    {isAuthorized
                        ?
                        <div className="flex justify-center">
                            <button
                                className="flex justify-center self-center bg-[#d93900] text-white text-[1.2rem]
                                px-4 p-1 rounded-full hover:bg-[#ae2c00] transition-colors"
                                onClick={() => logout()}>
                                Log out
                            </button>
                        </div>
                        :
                        <div className="flex justify-center">
                            <button
                                className="flex justify-center self-center bg-[#d93900] text-white text-[1.2rem]
                                    px-4 p-1 rounded-full hover:bg-[#ae2c00] transition-colors"
                                onClick={() => login()}>
                                Log in to Reddit
                            </button>
                        </div>
                    }
                </div>
            </div>

            <div
                className={`
                    flex flex-col t-8 w-full z-0 mt-14 sm:mt-0 fixed sm:w-80 ${clickedNav ? styles.navUnClicked : styles.navClicked}
                    ${isDarkTheme ? "bg-dark-surface" : "bg-light-surface"}
                `}
                style={{
                    transition: 'transform .5s ease',
                    height: "100dvh",
                }}
            >
                {/* DESKTOP HEADER */}
                <div className={`
                    ${styles.title}
                    hidden sm:flex w-full sm:w-80 items-center justify-center p-6 top-0 left-0 right-0 z-50
                    ${isDarkTheme ? "bg-dark-surface" : "bg-light-surface"}
                    `}>
                    <Link href={`/`} onClick={((e) => handleLinkClick(e))}>
                        <div className='flex items-center'>
                            <CustomIcon className={`w-12 h-12 transition-colors duration-500 ${isDarkTheme ? "text-white" : "text-[#ff4500]"}`} />
                            <h1 className={`${styles.hache} text-center font-bold text-3xl`}>
                                <span className={`transition-colors duration-500 ${isDarkTheme ? "text-white" : "text-[#ff4500]"}`}>redd</span>
                                <span className={styles.gradientText}>Art</span>
                            </h1>
                        </div>
                    </Link>
                </div>

                {/* NAV */}
                <div className={`pt-0 pb-10 sm:pb-0 overflow-scroll overflow-x-hidden ${isDarkTheme ? styles.darkScroll : styles.scroll}`}>
                    {isAuthorized
                        ?
                        <Suspense fallback={null}>
                            <ArtReddits />
                        </Suspense>
                        :
                        <Suspense fallback={null}>
                            <RedditLogin />
                        </Suspense>
                    }
                </div>

                {/* MOBILE ARROW DOWN */}
                <div
                    className={`
                        flex sm:hidden h-4 w-full justify-center hover:cursor-pointer hover:bg-light-primary/20 items-center
                        ${isDarkTheme ? styles.mobileDownDark : styles.mobileDown}
                    `}
                    onClick={(e) => dispatch(setClickedNav(true))}
                >
                    <div className={`flex`}>
                        <ChevronDownIcon className={`size-4 ${isDarkTheme ? "text-white" : ""}`} />
                    </div>
                </div>
            </div>
        </div>
    );
}
