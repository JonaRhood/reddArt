"use client";

import styles from '@/app/styles/Gallery.module.css';

import { useState, useEffect, useRef } from "react";
import { fetchUserReddit } from '@/app/lib/features/artLibrary/fetchData';
import Image from "next/image";
import Masonry from "react-masonry-css";
import { useRouter } from "next/navigation";
import { shimmer, toBase64 } from "@/app/lib/utils/utils";
import { UserIcon } from "@heroicons/react/24/solid";
import { cleanUrl } from "@/app/lib/utils/utils";
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";
import Link from 'next/link';

import { useAppSelector, useAppDispatch } from "@/app/lib/hooks";
import { RootState } from "@/app/lib/store";
import {
    setPosts, setLoadMorePosts, setBackgroundPosts,
    setLoading, setScrollPosition, resetGallery
} from "@/app/lib/features/userGallery/userGallerySlice"
import ZoomInGallery from '../ZoomInGallery/ZoomInGallery';

export default function UserGallery({ params }: { params: { user: string } }) {
    const redditUser = params.user;
    console.log(redditUser);

    const [sentinel, setSentinel] = useState(false);
    const [after, setAfter] = useState<string | null>(null);
    const [zoomImg, setZoomImg] = useState(false);
    const [zoomImgId, setZoomImgId] = useState<string | null>(null);
    const [backgroundOpacity, setBackgroundOpacity] = useState(false);
    const [rect, setRect] = useState<DOMRect | null>(null);
    const [imageStyles, setImageStyles] = useState({
        top: '',
        left: '',
        width: 'auto',
        height: 'auto',
        transition: '',
    });
    const [imageStylesMemory, setImageStylesMemory] = useState({
        top: '',
        left: '',
        width: 'auto',
        height: 'auto',
        transition: '',
    });

    const router = useRouter();

    const posts = useAppSelector((state: RootState) => state.userGallery.posts);
    const loading = useAppSelector((state: RootState) => state.userGallery.loading);
    const selectedSubReddit = useAppSelector((state: RootState) => state.userGallery.selectedSubReddit);
    const dispatch = useAppDispatch();

    const sentinelRef = useRef(null);
    const loadingBarRef = useRef<LoadingBarRef>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);


    // Loading Bar
    //////////////////////////////////////////////////////////////////////////////
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
        try {
            const result = await fetchUserReddit(redditUser, 100);
            const data = result.data.children;

            if (Array.isArray(data)) {
                dispatch(setPosts(data));
                setAfter(result.data.after);
                fetchDataAfterBackground(result.data.after)

            } else {
                console.error("Data received is not an array:", data);
            }
        } catch (error) {
            console.error("Error fetching redditUser data:", error);
        } finally {
            dispatch(setLoading(false))
            handleCompleteLoading();
        }
    };

    //Function to Fetch After Data on the backround
    ////////////////////////////////////////////////////////////////////////////
    const fetchDataAfterBackground = async (after: string) => {
        if (!after) {
            return;
        }
        try {
            const result = await fetchUserReddit(redditUser, 100, after);
            const data = result.data.children;

            if (Array.isArray(data)) {
                dispatch(setBackgroundPosts(data))
                setAfter(result.data.after);
            } else {
                console.error("Data received is not an array:", data);
            }
        } catch (error) {
            console.error("Error fetching redditUser after", error);
        } finally {
            setSentinel(true);
            console.log("fetchDataAfterBackground finished");
        }
    }

    useEffect(() => {
        const zoomedIn = sessionStorage.getItem("ZOOMED_IN");
        console.log(posts.length);
        console.log(zoomedIn)
        if (zoomedIn !== "true" || posts.length === 0) {
            handleStartLoading();
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }

            debounceRef.current = setTimeout(() => {
                console.log("Fetch", redditUser)
                fetchData();
            }, 1000);

            return () => {
                if (debounceRef.current) {
                    clearTimeout(debounceRef.current);
                }
            };
        }
    }, []);

    //Sentinel Effect to Load More pictures automatically when scrolling down
    ////////////////////////////////////////////////////////////////////////////////////////
    useEffect(() => {
        const fetchDataAfterBackgroundEffect = async () => {
            if (!after) return;
            try {
                const result = await fetchUserReddit(redditUser, 100, after);
                const data = result.data.children;

                if (Array.isArray(data)) {
                    dispatch(setBackgroundPosts(data));
                    setAfter(result.data.after);

                } else {
                    console.error("Data received is not an array:", data);
                }
            } catch (error) {
                console.error("Error fetching redditUser data:", error);
            } finally {
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

    }, [sentinel]);

    const handleImageZoom = (e: any, key: string) => {
        if (zoomImg === false) {
            setBackgroundOpacity(false);
            setZoomImg(true);
            setZoomImgId(key);
            const rect = e.target.getBoundingClientRect();
            document.body.style.overflow = "hidden";
            document.body.style.marginRight = "15px";

            const target = e.currentTarget;
            const childDiv = target.querySelector(`.${styles.divContainerImgClicked}`);

            const rectBackground = childDiv.getBoundingClientRect();
            // console.log("Rect Background", rectBackground);


            setImageStyles({
                top: `${rect.top}px`,
                left: `${rect.left - rectBackground.left}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                transition: '',
            });
            setImageStylesMemory({
                top: `${rect.top}px`,
                left: `${rect.left - rectBackground.left}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                transition: '',
            });
            setTimeout(() => {
                setImageStyles({
                    top: '10%',
                    left: `${rectBackground.left / 100 * 9}%`,
                    width: `${rect.width * 1.8}px `,
                    height: `${rect.height}px`,
                    transition: 'all .3s ease',
                });

             
            }, 100);
        } else {
            document.body.style.overflow = "visible";
            document.body.style.marginRight = "";
            setImageStyles({
                top: imageStylesMemory.top,
                left: imageStylesMemory.left,
                width: imageStylesMemory.width,
                height: imageStylesMemory.height,
                transition: 'all .3s ease',
            });
            setBackgroundOpacity(true);
            setTimeout(() => {
                setZoomImg(false);
                setZoomImgId("");
            }, 500);
        }
    };

    const handleClickBack= () => {
        router.replace("/r/comics", { scroll: false });
    }

    return (
        <div className='flex-1 ml-56 sm:ml-80 bg-light-background h-screen p-4 '>
            <div>
                <LoadingBar
                    color="#00BFFF"
                    ref={loadingBarRef}
                    height={4}
                    className={styles.loadingBar}
                    shadow={false}
                // onLoaderFinished={() => console.log("Loader finished")} 
                />
            </div>

            <>
                <Masonry
                    breakpointCols={{ default: 4, 1400: 3, 1000: 2, 700: 1 }}
                    className={styles.masonryGrid}
                    columnClassName={styles.masonryGridColumn}
                >
                    {Array.isArray(posts) && posts.map((item, index) => {
                        const preview = item.data.preview;
                        const imgSource = preview?.images?.[0]?.source?.url;
                        const key = item.data.id + index
                        const author = item.data.author;

                        if (!imgSource) {
                            return null;
                        }

                        return (
                            <div
                                key={key}
                                className={`${styles.imageContainer} ${zoomImg ? styles.imageContainerZoomIn : ""}`}
                                onClick={(e) => handleImageZoom(e, key)}
                            >
                                <div className='flex'>
                                    <div
                                        className={`${styles.divContainerImgClicked} ${zoomImgId === key ? styles.divContainerImgClickedActive : styles.divContainerImgClicked} ${backgroundOpacity ? styles.divContainerImgClickedOpacity : ""}`}
                                    >
                                        <div className={styles.divImgClicked}>
                                            <Image
                                                src={cleanUrl(imgSource)}
                                                alt={key}
                                                width={550}
                                                height={300}
                                                className={`${styles.imageUnClicked} ${zoomImg ? styles.imageClicked : styles.imageUnClicked}`}
                                                style={{
                                                    top: `${imageStyles.top}`,
                                                    left: `${imageStyles.left}`,
                                                    width: `${imageStyles.width}`,
                                                    transform: 'scale(1)',
                                                    position: 'absolute',
                                                    zIndex: 1000,
                                                    transition: `${imageStyles.transition}`,
                                                    padding: '0px',
                                                    borderRadius: '20px',
                                                }}
                                            />
                                            <Image
                                                src={cleanUrl(imgSource)}
                                                alt={key}
                                                width={550}
                                                height={300}
                                                className={`${styles.imageUnClicked} ${zoomImg ? styles.imageClickedBackground : styles.imageUnClicked}`}
                                                style={{
                                                    top: `${imageStyles.top}`,
                                                    left: `${imageStyles.left}`,
                                                    width: `${imageStyles.width}`,
                                                    transform: 'scale(1)',
                                                    position: 'absolute',
                                                    zIndex: 800,
                                                    transition: `${imageStyles.transition}`,
                                                    padding: '0px',
                                                    borderRadius: '20px',
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <Image
                                        src={cleanUrl(imgSource)}
                                        alt={key}
                                        width={800}
                                        height={600}
                                        className={styles.image}
                                        placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
                                    />
                                </div>
                                <div className={styles.gradientOverlay}></div>
                                <div className={styles.titleOverlay}>
                                    <i><UserIcon className="size-4" /></i>
                                    <span onClick={() => handleClickBack()} className="ml-3">{"u/" + author}</span>
                                </div>
                            </div>

                            // </Link>
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