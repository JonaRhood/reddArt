'use client';

import styles from '@/public/styles/artReddits.module.css'

import { fetchToNavBar } from "@/app/lib/features/artLibrary/fetchData";
import { reddits } from "@/app/lib/features/artLibrary/data";
import { useState, useEffect } from "react";
import { NavDivSkeleton } from "@/app/ui/skeletons";
import { ChevronRightIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { UserIcon } from '@heroicons/react/24/solid';
import { nFormatter } from "@/app/lib/utils/utils";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAppSelector, useAppDispatch } from '@/app/lib/hooks';
import { resetGallery, setSelectedSubReddit, setPastSubReddit, setScrollPosition, stopGalleryLoading } from "@/app/lib/features/gallery/gallerySlice";
import { RootState } from '@/app/lib/store';

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

    const router = useRouter();

    const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
    const pathSegments = currentPath.split('/');
    const currentSubreddit = pathSegments.length > 2 ? `r/${pathSegments[2]}` : "";

    const dispatch = useAppDispatch();

    useEffect(() => {
        const waitForToken = () => {
            return new Promise((resolve) => {
                dispatch(setSelectedSubReddit(currentSubreddit));  // Used for the CSS Selector of the Subreddit
                const checkToken = () => {
                    const localToken = localStorage.getItem("REDDART_ACCESS_TOKEN")
                    const localTokenTime = localStorage.getItem('REDDART_TOKEN_TIME');
                    const oneHour = 60 * 60 * 1000;
                    if (localToken && localTokenTime && Date.now() - parseInt(localTokenTime, 10) > oneHour) {
                        setTimeout(checkToken, 1000);
                    } else {
                        resolve(localToken);
                    }
                };
                checkToken();
            });
        };

        const fetchData = async () => {
            setLoading(true);
            try {
                await waitForToken();

                const dataPromises = reddits.map((reddit) => fetchToNavBar(reddit.subreddit));
                const results = await Promise.all(dataPromises) as RedditData[]; // Explicitly type the results as RedditData[]
                setRedditData(results.filter(result => result && result.data));

                console.log("Fetched SubReddit Results:", results);

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
            if (navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({ action: 'cancelPendingRequests' });
              console.log("ABORT")
            } else {
              console.log('No active Service Worker to send message to.');
            }
        // router.refresh();
        dispatch(stopGalleryLoading());
        dispatch(setPastSubReddit(currentSubreddit));
        dispatch(setSelectedSubReddit(subReddit));

        document.body.style.overflow = "visible";
        document.body.style.marginRight = "";

        // setAreLinksDisabled(true);
        // setTimeout(() => {
        //     setAreLinksDisabled(false);
        // }, 3000)
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
                            className={`
                            ${styles.container}
                            ${selectedSubreddit === subReddit ? styles.selectedReddit : ""}
                            ${selectedSubreddit === subReddit ? "pointer-events-none cursor-pointer" : ""}
                            ${areLinksDisabled && selectedSubreddit !== subReddit ? "pointer-events-none transition duration-500 ease-in-out opacity-70" : ""}
                            
                        `}
                        >
                            <Link href={`/${subReddit}`} key={i} onClick={(e) => {
                                handleLinkClick(e, subReddit);
                            }} scroll={false}>
                                {/* Blue pseudo-element */}
                                <div className={`
                                absolute top-0 left-0 w-1.5 h-full bg-blue-500 transition-transform ease duration-300 -translate-x-2
                                ${selectedSubreddit === subReddit ? "translate-x-0" : ""}
                                `}></div>

                                <div className='relative flex-column items-center p-3'>
                                    <div className="flex items-center relative">
                                        <Image src={iconImg} alt="Community Icon" width={50} height={50}
                                            className="rounded-full border border-2 border-light-primary"
                                        />
                                        <div className="flex-inline ml-3">
                                            <h4>{subReddit}</h4>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="flex text-light-secondaryText text-xs items-center my-1">
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
