"use client";

import { useState, useEffect } from "react";
import { fetchSubReddit } from "@/app/lib/features/artLibrary/fetchData";
import Image from "next/image";
import Masonry from "react-masonry-css";
import styles from '@/app/styles/overview.module.css';
import { v4 as uuidv4 } from 'uuid';
import { UserIcon } from "@heroicons/react/24/solid";

export default function Page({ params }: { params: { reddit: string } }) {
    const subReddit = params.reddit;
    const [subRedditInfo, setSubredditInfo] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userAvatars, setUserAvatars] = useState<{ [key: string]: string }>({});
    const [after, setAfter] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);

    const fetchData = async (afterParam = '') => {
        try {
            const result = await fetchSubReddit(subReddit, 100, afterParam);
            const data = result.data.children;

            if (Array.isArray(data)) {
                setSubredditInfo(prevData => [...prevData, ...data]); // Append new data to existing data
                setAfter(result.data.after || null); // Update 'after' for next fetch
                setHasMore(Boolean(result.data.after)); // Check if there's more data to load

            } else {
                console.error("Data received is not an array:", data);
                setHasMore(false);
            }
        } catch (error) {
            console.error("Error fetching subreddit data:", error);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(); // Initial fetch without 'after' parameter
    }, [subReddit]);

    // Function to load more data
    const loadMore = () => {
        if (hasMore && after) {
            setLoading(true);
            fetchData(after); // Fetch more data using the current 'after' value
        }
    };

    const cleanUrl = (url: string) => {
        try {
            const decodedUrl = decodeURIComponent(url);
            return decodedUrl.replace(/&amp;/g, '&');
        } catch (e) {
            console.error('Error decoding URL:', e);
            return url;
        }
    };

    return (
        <div>
            {loading && subRedditInfo.length === 0 ? (
                <p>Loading...</p> // You can replace this with a loading spinner or skeleton screen
            ) : (
                <>
                    <Masonry
                        breakpointCols={{ default: 4, 1100: 3, 700: 2, 500: 1 }}
                        className={styles.masonryGrid}
                        columnClassName={styles.masonryGridColumn}
                    >
                        {subRedditInfo.map((item) => {
                            const preview = item.data.preview;
                            const imgSource = preview?.images?.[0]?.source?.url;
                            const uniqueKey = uuidv4();
                            const author = item.data.author;

                            if (!imgSource) {
                                return null; // Skip items without image source
                            }

                            return (
                                <div key={uniqueKey} className={styles.imageContainer}>
                                    <Image
                                        src={cleanUrl(imgSource)}
                                        alt={uniqueKey}
                                        width={800}
                                        height={600}
                                        className={styles.image}
                                        priority
                                    />
                                    <div className={styles.titleOverlay}>
                                        <i><UserIcon className="size-4" /></i>
                                        <span className="ml-3">{"u/" + author}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </Masonry>
                    {hasMore && (
                        <button onClick={loadMore} className={styles.loadMoreButton}>
                            Load More
                        </button>
                    )}
                </>
            )}
        </div>
    );
}
