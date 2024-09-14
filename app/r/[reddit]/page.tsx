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

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/app/lib/store";
import { setPosts, setAfter, setLoading, setScrollPosition } from "@/app/lib/features/gallery/gallerySlice";

export default function Page({ params }: { params: { reddit: string } }) {
    const subReddit = params.reddit;
    const [subRedditInfo, setSubredditInfo] = useState<any[]>([]);
    // const [loading, setLoading] = useState(true);
    // const [after, setAfter] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [imgZoomed, setImgZoomed] = useState<string | null>(null);

    const router = useRouter();

    const posts = useSelector((state: RootState) => state.gallery.posts);
    const after = useSelector((state: RootState) => state.gallery.after);
    const loading = useSelector((state: RootState) => state.gallery.loading);
    const dispatch = useDispatch();


    const fetchData = async (afterParam = '') => {
        dispatch(setLoading(true)); // Activa el estado de carga
        try {
            const result = await fetchSubReddit(subReddit, 100, afterParam);
            const data = result.data.children;

            if (Array.isArray(data)) {
                dispatch(setPosts(afterParam === '' ? data : [...posts, ...data]));
                dispatch(setAfter(result.data.after || null)); // Update 'after' for next fetch
            } else {
                console.error("Data received is not an array:", data);
                setHasMore(false);
            }
        } catch (error) {
            console.error("Error fetching subreddit data:", error);
            setHasMore(false);
        } finally {
            dispatch(setLoading(false)); // Desactiva el estado de carga
        }
    };

    useEffect(() => {
        dispatch(setPosts([])); // Reiniciar posts al cambiar de subreddit
        dispatch(setAfter(null)); // Reiniciar after al cambiar de subreddit
        fetchData(); // Realizar la nueva búsqueda
    }, [subReddit]);

    // Function to load more data
    const loadMore = () => {
        if (after) {
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

    const handleImageZoomIn = (key: string, imgUrl: string) => {
        dispatch(setScrollPosition(window.scrollY)); // Guarda el scroll en Redux
        sessionStorage.setItem('scrollPosition', window.scrollY.toString()); // Almacena en sessionStorage
        router.push(`/r/${subReddit}/${key}?imgUrl=${encodeURIComponent(cleanUrl(imgUrl))}`);
    };

    return (
        <div>
            {loading && posts.length === 0 ? (
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
                    {after && (
                        <button onClick={loadMore} className={styles.loadMoreButton}>
                            Load More
                        </button>
                    )}
                </>
            )}
        </div>
    );
}