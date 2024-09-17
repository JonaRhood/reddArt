"use client";

import styles from '@/app/styles/overview.module.css';

import { useState, useEffect, useRef } from "react";
import { fetchSubReddit } from "@/app/lib/features/artLibrary/fetchData";
import Image from "next/image";
import Masonry from "react-masonry-css";
import { useRouter } from "next/navigation";
import { shimmer, toBase64 } from "@/app/lib/utils/utils";
import { UserIcon } from "@heroicons/react/24/solid";
import { cleanUrl } from "@/app/lib/utils/utils";

import { useAppSelector, useAppDispatch } from "@/app/lib/hooks";
import { RootState } from "@/app/lib/store";
import {
    setPosts, setLoadMorePosts, setBackgroundPosts,
    setLoading, setScrollPosition, resetGallery
} from "@/app/lib/features/gallery/gallerySlice";

export default function Page({ params }: { params: { reddit: string } }) {
    const subReddit = params.reddit;

    const [imgZoomed, setImgZoomed] = useState<string | null>(null);
    const [sentinel, setSentinel] = useState(false);
    const [after, setAfter] = useState<string | null>(null);

    const router = useRouter();

    const posts = useAppSelector((state: RootState) => state.gallery.posts);
    const loading = useAppSelector((state: RootState) => state.gallery.loading);
    const dispatch = useAppDispatch();

    const sentinelRef = useRef(null);

    //Function to Fetch Data
    ////////////////////////////////////////////////////////////////////////////
    const fetchData = async (afterParam = '') => {
        // dispatch(setLoading(true)); // Activa el estado de carga
        try {
            const result = await fetchSubReddit(subReddit, 100);
            const data = result.data.children;

            if (Array.isArray(data)) {
                dispatch(setPosts(data));
                setAfter(result.data.after);
                fetchDataAfterBackground(result.data.after)

            } else {
                console.error("Data received is not an array:", data);
            }
        } catch (error) {
            console.error("Error fetching subreddit data:", error);
        } finally {
            dispatch(setLoading(false));
        }
    };

    //Function to Fetch After Data on the backround
    ////////////////////////////////////////////////////////////////////////////
    const fetchDataAfterBackground = async (after: string) => {
        if (!after) {
            return;
        }
        try {
            const result = await fetchSubReddit(subReddit, 100, after);
            const data = result.data.children;

            if (Array.isArray(data)) {
                dispatch(setBackgroundPosts(data))
                setAfter(result.data.after);
            } else {
                console.error("Data received is not an array:", data);
            }
        } catch (error) {
            console.error("Error fetching subreddit after", error);
        } finally {
            setSentinel(true);
            console.log("fetchDataAfterBackground finished");
        }
    }

    useEffect(() => {
        fetchData()
    }, [subReddit]);

    //Sentinel Effect to Load More pictures automatically when scrolling down
    ////////////////////////////////////////////////////////////////////////////////////////
    useEffect(() => {

        const fetchDataAfterBackgroundEffect = async () => {
            if (!after) return;
            try {
                const result = await fetchSubReddit(subReddit, 100, after);
                const data = result.data.children;

                if (Array.isArray(data)) {
                    dispatch(setBackgroundPosts(data));
                    setAfter(result.data.after);

                } else {
                    console.error("Data received is not an array:", data);
                }
            } catch (error) {
                console.error("Error fetching subreddit data:", error);
            } finally {
                dispatch(setLoading(false));
                setSentinel(true);
                console.log("fetchDataAfterBackgroundEffect finished");
            }
        };

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 1.0,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                console.log('IntersectionObserver entry:', entry);
                if (entry.isIntersecting) {
                    console.log('Sentinel is in view');
                    dispatch(setLoadMorePosts())
                    fetchDataAfterBackgroundEffect();
                    setSentinel(false);
                }
            });
        }, observerOptions);

        if (sentinelRef.current) {
            console.log('Observing sentinel');
            observer.observe(sentinelRef.current);
        }

        // Cleanup on component unmount
        return () => {
            if (sentinelRef.current) {
                console.log('Unobserving sentinel');
                observer.unobserve(sentinelRef.current);
            }
        };

    }, [sentinel, after]);



    const handleImageZoomIn = (key: string, imgUrl: string) => {
        // dispatch(setScrollPosition(window.scrollY)); // Guarda el scroll en Redux
        // router.push(`/r/${subReddit}/${key}?imgUrl=${encodeURIComponent(cleanUrl(imgUrl))}`);
    };

    return (
        <div>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <Masonry
                        breakpointCols={{ default: 4, 1400: 3, 1000: 2, 700: 1 }}
                        className={styles.masonryGrid}
                        columnClassName={styles.masonryGridColumn}
                    >
                        {Array.isArray(posts) && posts.map((item, index) => {
                            const preview = item.data.preview;
                            const imgSource = preview?.images?.[0]?.source?.url;
                            const key = `${item.data.name}-${index}`;
                            const author = item.data.author;

                            if (!imgSource) {
                                return null;
                            }

                            return (
                                <div
                                    key={key}
                                    className={`${styles.imageContainer} ${imgZoomed === imgSource ? styles.imgZoom : ""}`}
                                    onClick={() => handleImageZoomIn(key, imgSource)}
                                >
                                    <Image
                                        src={cleanUrl(imgSource)}
                                        alt={key}
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
                            );
                        })}
                    </Masonry>
                    {sentinel && (
                        <div
                            ref={sentinelRef}
                            className={styles.sentinel}
                        ></div>
                    )}
                </>
            )}
        </div>
    );
}