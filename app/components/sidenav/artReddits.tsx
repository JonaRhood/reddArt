'use client';

import { fetchToNavBar } from "@/lib/features/artLibrary/fetchData"
import { reddits } from "@/lib/features/artLibrary/data"
import { useState, useEffect } from "react"

export default function ArtReddits() {

    const [redditData, setRedditData] = useState<{ [key: string]: any }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const dataPromises = reddits.map((reddit) => fetchToNavBar(reddit.url));
                const dataResults = await Promise.all(dataPromises);
                setRedditData(dataResults);
                console.log(redditData);
            } catch (error) {
                console.error("Error fetching Reddit data:", error);
            }
        };

        fetchData();
    }, [])
    
    console.log(redditData);

    return (
        <div>
            <div className="flex w-80 bg-gray-200 p-2 h-24 border-gray-300 border relative">
            </div>
            {redditData.map((reddit, i) => {
                const children = reddit.data?.children || [];
                const subReddit = children[0]?.data?.subreddit || "No title available";
                return (
                    <div
                    key={subReddit}
                    className="flex-column w-full bg-gray-200 p-2 h-24 border-gray-300 border overflow-hidden"
                    >
                        <h4>{subReddit}</h4><br/>
                    </div>
                )
            })}
        </div>
    )
}