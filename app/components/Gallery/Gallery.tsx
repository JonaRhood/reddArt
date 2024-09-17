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
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";

import { useAppSelector, useAppDispatch } from "@/app/lib/hooks";
import { RootState } from "@/app/lib/store";
import {
    setPosts, setLoadMorePosts, setBackgroundPosts,
    setLoading, setScrollPosition, resetGallery
} from "@/app/lib/features/gallery/gallerySlice";

export default function Gallery({ params }: { params: { reddit: string } }) {
    const subReddit = params.reddit;

    const [imgZoomed, setImgZoomed] = useState<string | null>(null);
    const [sentinel, setSentinel] = useState(false);
    const [after, setAfter] = useState<string | null>(null);
    const [savedScroll, setSavedScroll] = useState<number | null>(0);

    const router = useRouter();

    const posts = useAppSelector((state: RootState) => state.gallery.posts);
    const loading = useAppSelector((state: RootState) => state.gallery.loading);
    const selectedSubReddit = useAppSelector((state: RootState) => state.gallery.selectedSubReddit);
    const dispatch = useAppDispatch();

    const sentinelRef = useRef(null);
    const loadingBarRef = useRef<LoadingBarRef>(null);

    const handleStartLoading = () => {
        if (loadingBarRef.current) {
            loadingBarRef.current.continuousStart();
        }
    };

    // Function to complete the loading bar
    const handleCompleteLoading = () => {
        if (loadingBarRef.current) {
            loadingBarRef.current.complete();
        }
    };

    //Function to Fetch Data
    ////////////////////////////////////////////////////////////////////////////
    const fetchData = async (afterParam = '') => {
        dispatch(setLoading(true));
        handleStartLoading();
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
            dispatch(setLoading(false))
            handleCompleteLoading();;
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
        // const splitPr = selectedSubReddit?.split('/');
        // const selectedSubRedditSplit = splitPr && splitPr[1];

        // console.log(selectedSubRedditSplit, subReddit)
        // if (selectedSubRedditSplit !== subReddit) {
        //     fetchData()
        // } else if (selectedSubReddit !== selectedSubReddit) {
            
        // }
        fetchData();
    }, [selectedSubReddit]);

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
            observer.observe(sentinelRef.current);
        }

        // Cleanup on component unmount
        return () => {
            if (sentinelRef.current) {
                observer.unobserve(sentinelRef.current);
            }
        };

    }, [sentinel, after]);

    const handleImageZoomIn = (key: string, imgUrl: string) => {
        setSavedScroll(window.scrollY);
        router.push(`/r/${subReddit}/${key}?imgUrl=${encodeURIComponent(cleanUrl(imgUrl))}`, { scroll: false });
    };

    return (
        <div>
            <div>
                <LoadingBar color="#00BFFF" ref={loadingBarRef} height={3} /></div>
                
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
        </div>
    );
}