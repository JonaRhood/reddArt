'use client';

import styles from '@/public/styles/artReddits.module.css'

import { fetchToNavBar } from "@/app/assets/lib/artLibrary/fetchData";
import { reddits } from "@/app/assets/lib/artLibrary/data";
import { useState, useEffect } from "react";
import { NavDivSkeleton } from "@/app/assets/lib/ui/skeletons";
import { ChevronRightIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { UserIcon } from '@heroicons/react/24/solid';
import { nFormatter } from "@/app/assets/lib/utils/utils";
import 'react-loading-skeleton/dist/skeleton.css';
import Link from "next/link";
import { useAppSelector, useAppDispatch } from '@/app/assets/store/hooks';
import { setSelectedSubReddit, setPastSubReddit, stopGalleryLoading } from "@/app/assets/store/slices/gallerySlice/gallerySlice";
import { setClickedNav } from '@/app/assets/store/slices/mobileSlice/mobileSlice';
import { RootState } from '@/app/assets/store/store';

interface RedditData {
    data: {
        display_name_prefixed: string;
        icon_img?: string;
        community_icon?: string;
        subscribers: number;
    };
}


export default function ArtReddits() {
    const [redditData, setRedditData] = useState<{ [key: string]: any }[]>([]);
    const [loading, setLoading] = useState(true);
    const [areLinksDisabled, setAreLinksDisabled] = useState(false);

    const selectedSubreddit = useAppSelector((state: RootState) => state.gallery.selectedSubReddit);
    const pastSubReddit = useAppSelector((state: RootState) => state.gallery.pastSubReddit);
    const isDarkTheme = useAppSelector((state: RootState) => state.theme.isDarkTheme);

    const router = useRouter();

    const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
    const pathSegments = currentPath.split('/');
    const currentSubreddit = pathSegments.length > 2 ? `r/${pathSegments[2]}` : "";

    const dispatch = useAppDispatch();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                dispatch(setSelectedSubReddit(currentSubreddit)); 

                const dataPromises = reddits.map((reddit) => fetchToNavBar(reddit.subreddit));
                const results = await Promise.all(dataPromises) as RedditData[]; // Explicitly type the results as RedditData[]
                setRedditData(results.filter(result => result && result.data));

                // console.log("Fetched SubReddit Results:", results);

            } catch (error) {
                console.error("Error fetching Reddit data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, subReddit: string) => {
        e.stopPropagation();
        if (selectedSubreddit === subReddit) {
            dispatch(setClickedNav(false));
        } else {
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ action: 'cancelPendingRequests' });
                // console.log("ABORT")
            } else {
                console.log('No active Service Worker to send message to.');
            }
            if (window.innerWidth < 640) {
                // console.log("Screen: 640px");
                dispatch(setClickedNav(false));
            }
            dispatch(stopGalleryLoading());
            dispatch(setPastSubReddit(currentSubreddit));
            dispatch(setSelectedSubReddit(subReddit));

            document.body.style.overflow = "visible";
            document.body.style.marginRight = "";
        }
    };

    return (
        <div>
            {loading ? (
                <NavDivSkeleton redditAmount={reddits.length} />
            ) : (
                redditData.map((redditItem, i) => {
                    const children = redditItem.data || {};
                    const subReddit = children.display_name_prefixed || "No title available";
                    const iconImg = children.icon_img || children.community_icon.replace(/&amp;/g, '&');
                    const subscribers = nFormatter(children.subscribers, 1);

                    return (
                        <div
                            key={subReddit}
                            tabIndex={0}
                            className={`
                            ${isDarkTheme ? styles.darkContainer : styles.container}
                            ${selectedSubreddit === subReddit ? isDarkTheme ? styles.selectedRedditDark : styles.selectedReddit : ""}
                            ${selectedSubreddit === subReddit ? "sm:pointer-events-none cursor-pointer" : ""}
                            ${areLinksDisabled && selectedSubreddit !== subReddit ? "pointer-events-none transition duration-500 ease-in-out opacity-70" : ""}
                            ${isDarkTheme ? "bg-dark-surface" : "bg-light-surface"}
                            
                        `}
                        >
                            <Link href={`/${subReddit}`} key={i} onClick={(e) => {
                                handleLinkClick(e, subReddit);
                            }} scroll={false}>
                                {/* Blue pseudo-element */}
                                <div className={`
                                absolute top-0 left-0 w-1.5 h-full transition-color ease duration-1000 -translate-x-2
                                ${isDarkTheme ? "bg-purple-500" : "bg-blue-500"}
                                ${selectedSubreddit === subReddit ? "translate-x-0" : ""}
                                `}></div>

                                <div className='relative flex-column items-center p-3'>
                                    <div className="flex items-center relative">
                                        <Image src={iconImg} alt="Community Icon" width={50} height={50}
                                            className={isDarkTheme ? styles.iconDark : styles.icon}
                                            onError={(e) => {
                                                e.currentTarget.className = 'hidden'
                                            }}
                                            priority={true}
                                            loading="eager"
                                        />
                                        <div className="flex-inline ml-3">
                                            <h4>{subReddit}</h4>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className={`
                                            flex text-xs items-center my-1
                                            ${isDarkTheme ? "text-gray-400" : "text-light-secondaryText"}
                                        `}>
                                            <UserIcon className="size-3" />
                                            <p>{subscribers}</p>
                                        </div>
                                    </div>
                                    <ChevronRightIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 size-3" />
                                </div>
                            </Link>
                        </div>
                    );
                })
            )}
        </div>
    );
};
