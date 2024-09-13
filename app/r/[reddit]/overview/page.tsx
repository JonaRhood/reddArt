"use client";

import { useState, useEffect } from "react";
import { fetchSubReddit, fetchUserAvatars } from "@/app/lib/features/artLibrary/fetchData";
import Image from "next/image";
import styles from '@/app/styles/overview.module.css';

const BATCH_SIZE = 25; // Adjust batch size as needed

export default function Page({ params }: { params: { reddit: string } }) {
    const subReddit = "r/" + params.reddit;
    const [subRedditInfo, setSubredditInfo] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userAvatars, setUserAvatars] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await fetchSubReddit(subReddit);
                const data = result.data.children;

                if (Array.isArray(data)) {
                    setSubredditInfo(data);

                    // Collect authors and fetch avatars in batches
                    const authors = data.map((item: any) => item.data.author);
                    const uniqueAuthors = Array.from(new Set(authors)); // Remove duplicates

                    const fetchBatchedAvatars = async (authors: string[]) => {
                        let avatars: { [key: string]: string } = {};
                        for (let i = 0; i < authors.length; i += BATCH_SIZE) {
                            const batch = authors.slice(i, i + BATCH_SIZE);
                            const batchAvatars = await fetchUserAvatars(batch);
                            avatars = { ...avatars, ...batchAvatars };
                        }
                        return avatars;
                    };

                    const avatars = await fetchBatchedAvatars(uniqueAuthors);
                    setUserAvatars(avatars);
                } else {
                    console.error("Data received is not an array:", data);
                }
            } catch (error) {
                console.error("Error fetching subreddit data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [subReddit]);

    return (
        <div className={styles.galleryContainer}>
            {loading ? (
                <p>Loading...</p> // You can replace this with a loading spinner or skeleton screen
            ) : (
                subRedditInfo.map((item, i) => {
                    const preview = item.data.preview;
                    const imgSource = preview?.images?.[0]?.source?.url;
                    const uniqueKey = item.data.id || item.data.name;
                    const author = item.data.author;
                    const avatarUrl = userAvatars[author];

                    if (!imgSource) {
                        return null; // Skip items without image source
                    }

                    return (
                        <div key={uniqueKey} className={styles.imageContainer}>
                            <Image
                                src={imgSource}
                                alt={uniqueKey}
                                width={800}
                                height={600}
                                className={styles.image}
                                priority
                            />
                            <div className={styles.titleOverlay}>
                                {avatarUrl && (
                                    <Image
                                        src={avatarUrl}
                                        alt={`Avatar of ${author}`}
                                        width={40}
                                        height={40}
                                        className={styles.avatar}
                                    />
                                )}
                                <span>{"u/" + author}</span>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};
