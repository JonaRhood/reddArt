'use client';

import { fetchToNavBar } from "@/app/lib/features/artLibrary/fetchData";
import { reddits } from "@/app/lib/features/artLibrary/data";
import { useState, useEffect } from "react";
import { searchReddit } from "@/app/lib/features/artLibrary/fetchData";
import { ChevronRightIcon } from '@heroicons/react/24/solid';
import { UserIcon } from '@heroicons/react/24/solid'
import { nFormatter } from "@/app/lib/utils/utils";
import Link from "next/link";

export default function ArtReddits() {

    const [reddit, setReddit] = useState('');
    const [redditData, setRedditData] = useState<{ [key: string]: any }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const dataPromises = reddits.map((reddit) => fetchToNavBar(reddit.url));
                const dataResults = await Promise.all(dataPromises);
                setRedditData(dataResults);

                localStorage.setItem('lastFetchTime', Date.now().toString());
            } catch (error) {
                console.error("Error fetching Reddit data:", error);
            }
        };
        fetchData();

        // const lastFetchTime = localStorage.getItem('lastFetchTime');
        // const currentTime = Date.now();

        // if (!lastFetchTime || (currentTime - parseInt(lastFetchTime, 10)) > 60000) {
        //     fetchData();
        // }
    }, []);

    return (
        <div>
            <div className="flex w-80 bg-gray-100 p-2 h-24 border-light-border border relative">
            </div>
            {redditData.map((redditItem, i) => {
                const children = redditItem.data || [];
                const subReddit = children.display_name_prefixed || "No title available";
                const iconImg = children.icon_img ? children.icon_img : children.community_icon;
                const subscribers = nFormatter(children.subscribers, 1);

                return (
                    <div
                        key={subReddit}
                        className="flex-column content-around w-full bg-gray-100 p-2 h-24 border-light-border border overflow-hidden transition all hover:bg-light-primary hover:bg-opacity-20 hover:cursor-pointer"
                    >
                        <Link
                            href={`/${subReddit}/overview`}
                            key={i}
                        >
                            <div className="flex items-center relative">
                                <img src={iconImg} alt="Communty Icon" width={50}
                                    className="rounded-full border border-2 border-light-primary"
                                />
                                <div className="flex-inline ml-3">
                                    <h4 className="">{subReddit}</h4>
                                </div>
                                <ChevronRightIcon className="absolute size-3 right-1" />
                            </div>
                            <div className="flex items-center">
                                <div className="flex text-light-secondaryText text-xs items-center my-1">
                                    <UserIcon className="size-3" />
                                    <p>{subscribers}</p>
                                </div>
                                <div className="text-light-secondaryText text-xs items-center mx-2">


                                </div>
                            </div>
                        </Link>
                    </div>
                );
            })}
        </div >
    );
}
