'use client';

import { fetchToNavBar } from "@/app/lib/features/artLibrary/fetchData";
import { reddits } from "@/app/lib/features/artLibrary/data";
import { useState, useEffect } from "react";
import { NavDivSkeleton } from "@/app/ui/skeletons";
import { ChevronRightIcon } from '@heroicons/react/24/solid';
import Image from "next/image";
import { UserIcon } from '@heroicons/react/24/solid';
import { nFormatter } from "@/app/lib/utils/utils";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';
import Link from "next/link";

const BATCH_SIZE = 25; // Adjust the batch size as needed

export default function ArtReddits() {

    const [redditData, setRedditData] = useState<{ [key: string]: any }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const dataPromises = reddits.map((reddit) => fetchToNavBar(reddit.subreddit));
                const results = await Promise.all(dataPromises);
                setRedditData(results.filter(result => result && result.data)); // Filter out invalid results

                console.log("Fetched Results:", results);
                
                localStorage.setItem('lastFetchTime', Date.now().toString());
            } catch (error) {
                console.error("Error fetching Reddit data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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
                            className="flex-column content-around w-full bg-light-surface p-2 h-24 overflow-hidden border-b-2 transition all hover:bg-light-primary hover:bg-opacity-20 hover:cursor-pointer"
                        >
                            <Link href={`/${subReddit}/overview`} key={i}>
                                <div className="relative flex-column items-center">
                                    <div className="flex items-center relative">
                                        <Image src={iconImg} alt="Community Icon" width={50} height={50}
                                            className="rounded-full border border-2 border-light-primary"
                                        />
                                        <div className="flex-inline ml-3">
                                            <h4>{subReddit || <Skeleton width={150} />}</h4>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="flex text-light-secondaryText text-xs items-center my-1">
                                            <UserIcon className="size-3" />
                                            <p>{subscribers || <Skeleton width={30} />}</p>
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
