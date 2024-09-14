"use client";

import { useState, useEffect } from "react";
import { fetchSubReddit } from "@/app/lib/features/artLibrary/fetchData";
import Image from "next/image";
import Masonry from "react-masonry-css";
import styles from '@/app/styles/overview.module.css';
import { v4 as uuidv4 } from 'uuid';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { shimmer, toBase64 } from "@/app/lib/utils/utils";
import { UserIcon } from "@heroicons/react/24/solid";

export default function Page({ params }: { params: { reddit: string } }) {
    const subReddit = params.reddit;
    const [subRedditInfo, setSubredditInfo] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [after, setAfter] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [imgZoomed, setImgZoomed] = useState<string | null>(null);

    const router = useRouter();

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

    const handleImageZoom = (uniqueKey: string) => {
        setImgZoomed(prevKey => (prevKey === uniqueKey ? null : uniqueKey));
        router.replace(`/r/${subReddit}?id=${uniqueKey}`);
    };

    return (
        <div>
            {loading && subRedditInfo.length === 0 ? (
                <p>Loading...</p> // You can replace this with a loading spinner or skeleton screen
            ) : (
                <>
                    <Masonry
                        breakpointCols={{ default: 4, 1400: 3, 1000: 2, 700: 1 }}
                        className={styles.masonryGrid}
                        columnClassName={styles.masonryGridColumn}
                    >
                        {subRedditInfo.map((item) => {
                            const preview = item.data.preview;
                            const imgSource = preview?.images?.[0]?.source?.url;
                            const uniqueKey = item.data.name; // Utilizar el nombre del post o un identificador persistente
                            const author = item.data.author;

                            if (!imgSource) {
                                return null; // Skip items without image source
                            }

                            return (
                                // <Link href={`/r/${subReddit}/${uniqueKey}?imgUrl=${encodeURIComponent(cleanUrl(imgSource))}`}

                                //     key={uniqueKey}
                                //     passHref
                                // >
                                    <div
                                        key={uniqueKey}
                                        className={`${styles.imageContainer} ${imgZoomed === uniqueKey ? styles.imgZoom : ""}`} // Solo agregar la clase si el uniqueKey coincide con imgZoomed
                                        onClick={() => handleImageZoom(uniqueKey)} // Pasar el uniqueKey
                                    >
                                        <Image
                                            src={cleanUrl(imgSource)}
                                            alt={uniqueKey}
                                            width={800}
                                            height={600}
                                            className={styles.image}
                                            priority
                                            placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
                                        />

                                        <div className={styles.gradientOverlay}></div>

                                        <div className={styles.titleOverlay}>
                                            <i><UserIcon className="size-4" /></i>
                                            <span className="ml-3">{"u/" + author}</span>
                                        </div>
                                    </div>
                                // </Link>
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
