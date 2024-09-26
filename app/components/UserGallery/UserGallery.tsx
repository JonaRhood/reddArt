"use client";

import styles from '@/app/styles/Gallery.module.css';

import { useState, useEffect, useRef } from "react";
import { fetchUserReddit } from '@/app/lib/features/artLibrary/fetchData';
import { fetchUserIcon } from '@/app/lib/features/artLibrary/fetchData';
import Image from "next/image";
import Masonry from "react-masonry-css";
import { useRouter } from "next/navigation";
import { shimmer, toBase64 } from "@/app/lib/utils/utils";
import { UserIcon } from "@heroicons/react/24/solid";
import { cleanUrl } from "@/app/lib/utils/utils";
import { grayShimmer } from '@/app/lib/utils/utils';
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";
import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import Skeleton from 'react-loading-skeleton';
import Link from 'next/link';

import { useAppSelector, useAppDispatch } from "@/app/lib/hooks";
import { RootState } from "@/app/lib/store";
import {
    setPosts, setLoadMorePosts, setBackgroundPosts,
    setLoading, setScrollPosition, resetGallery, stopGalleryLoading,
} from "@/app/lib/features/userGallery/userGallerySlice"
import { setModalIsOpen } from '@/app/lib/features/gallery/gallerySlice';

interface RedditResponse {
    data: {
        children: Array<{ /* Define the structure of each post here */ }>;
        after: string | null;
    };
}

interface IconResponse {
    data: {
        children: Array<{ /* Define the structure of each post here */ }>;
        icon_img: string | null;
    };
}

export default function UserGallery({ params }: { params: { user: string } }) {
    const redditUser = params.user;

    const [isMounted, setIsMounted] = useState(false);

    const [sentinel, setSentinel] = useState(false);
    const [after, setAfter] = useState<string | null>(null);
    const [zoomImg, setZoomImg] = useState(false);
    const [zoomImgId, setZoomImgId] = useState<string | null>(null);
    const [iconUser, setIconUser] = useState<string | null>(null);
    const [backgroundOpacity, setBackgroundOpacity] = useState(false);
    const [rect, setRect] = useState<DOMRect | null>(null);
    const [loadingIcon, setLoadingIcon] = useState(false);
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
    const selectedSubReddit = useAppSelector((state: RootState) => state.gallery.selectedSubReddit);
    const abortControllerRef = useRef<AbortController | null>(null);
    const dispatch = useAppDispatch();

    const sentinelRef = useRef(null);
    const loadingBarRef = useRef<LoadingBarRef>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setIsMounted(true);
        console.log(redditUser, "MONTADO")

        return () => {
            setIsMounted(false);
            abortFetch();
            console.log(redditUser, "DESMONTADO")
        };
    }, []);

    function isSafari() {
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    }

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

    const abortFetch = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
    };

    //Function to Fetch Data
    ////////////////////////////////////////////////////////////////////////////
    const fetchData = async (afterParam = '') => {
        dispatch(setLoading(true));
        // abortFetch();

        const signal = abortControllerRef.current?.signal;

        try {
            const result = await fetchUserReddit(redditUser, 25, '', '', signal) as RedditResponse;
            const data = result.data.children;

            if (Array.isArray(data)) {
                dispatch(setPosts(data));
                setAfter(result.data.after);
                const after = result.data.after;
                if (after) {
                    fetchDataAfterBackground(after);
                }

            } else {
                console.error("Data received is not an array:", data);
            }
        } catch (error: unknown) {
            if (error instanceof TypeError) {
            } else if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    console.log('Fetch aborted');
                } else {
                    console.error('Fetch Error:', error);
                }
            }
        } finally {
            dispatch(setLoading(false))
            handleCompleteLoading();
        }
    };

    //Function to Fetch After Data on the backround
    ////////////////////////////////////////////////////////////////////////////
    const fetchDataAfterBackground = async (after: string) => {
        if (!after) return;
        abortFetch();

        const signal = abortControllerRef.current?.signal;

        try {
            const result = await fetchUserReddit(redditUser, 25, after, '', signal) as RedditResponse;
            const data = result.data.children;

            if (Array.isArray(data)) {
                dispatch(setBackgroundPosts(data))
                setAfter(result.data.after);
            } else {
                console.error("Data received is not an array:", data);
            }
        } catch (error: unknown) {
            if (error instanceof TypeError) {
            } else if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    console.log('Fetch aborted');
                } else {
                    console.error('Fetch Error:', error);
                }
            }
        } finally {
            setSentinel(true);
        }
    }

    //Fetching User Icon
    ////////////////////////////////////////////////////////////////////////////
    const fetchIcon = async () => {
        setLoadingIcon(true);
        abortFetch();

        const signal = abortControllerRef.current?.signal;

        try {
            const result = await fetchUserIcon(redditUser, signal) as IconResponse;

            if (result && result.data) {
                const icon = result.data.icon_img;

                if (icon) {
                    setIconUser(result.data.icon_img);
                } else {
                    console.error("icon_img no encontrado en los datos recibidos:", result.data);
                }
            } else {
                console.error("Data received is not in expected format:", result);
            }
        } catch (error: unknown) {
            if (error instanceof TypeError) {
            } else if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    console.log('Fetch aborted');
                } else {
                    console.error('Fetch Error:', error);
                }
            }
        } finally {
            setLoadingIcon(true);
        }
    };

    //Starter Effect
    ////////////////////////////////////////////////////////////////////////////
    useEffect(() => {
        if (isMounted) {
            const zoomedIn = sessionStorage.getItem("ZOOMED_IN");
            if (zoomedIn !== "true" || posts.length === 0) {
                handleStartLoading();
                if (debounceRef.current) {
                    clearTimeout(debounceRef.current);
                }

                debounceRef.current = setTimeout(() => {
                    fetchData();
                    fetchIcon();
                }, 100);

                return () => {
                    if (debounceRef.current) {
                        clearTimeout(debounceRef.current);
                    }
                    abortFetch();
                };
            }
        }
    }, [redditUser, isMounted]);

    //Sentinel Effect to Load More pictures automatically when scrolling down, depends on sentinel view
    ////////////////////////////////////////////////////////////////////////////////////////
    useEffect(() => {
        if (isMounted) {
            const fetchDataAfterBackgroundEffect = async () => {
                if (!after) return;

                const signal = abortControllerRef.current?.signal;

                try {
                    const result = await fetchUserReddit(redditUser, 25, after, '', signal) as RedditResponse;
                    const data = result.data.children;

                    if (Array.isArray(data)) {
                        dispatch(setBackgroundPosts(data));
                        setAfter(result.data.after);

                    } else {
                        console.error("Data received is not an array:", data);
                    }
                } catch (error: unknown) {
                    if (error instanceof TypeError) {
                    } else if (error instanceof Error) {
                        if (error.name === 'AbortError') {
                            console.log('Fetch aborted');
                        } else {
                            console.error('Fetch Error:', error);
                        }
                    }
                } finally {
                    setSentinel(true);
                }
            };

            const observerOptions = {
                root: null,
                rootMargin: '0px',
                threshold: 1.0,
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
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
        }
    }, [sentinel, isMounted]);

    // Handle Zoom, transition and animation when Image is clicked
    ////////////////////////////////////////////////////////////////////////////////////////
    const handleImageZoom = (e: any, key: string) => {
        if (zoomImg === false) {
            setBackgroundOpacity(false);
            setZoomImg(true);
            setZoomImgId(key);
            const rect = e.target.getBoundingClientRect();
            // document.body.style.overflow = "hidden";
            // document.body.style.marginRight = "15px";

            const target = e.currentTarget;
            const childDiv = target.querySelector(`.${styles.divContainerImgClicked}`);

            const rectBackground = childDiv.getBoundingClientRect();

            if (isSafari()) {
                setImageStyles({
                    top: '15%',
                    left: `${rectBackground.left / 100 * 9}%`,
                    width: `${rect.width * 1.8}px `,
                    height: `${rect.height}px`,
                    transition: 'all 0s ease',
                });
                setImageStylesMemory({
                    top: `${rect.top}px`,
                    left: `${rect.left - rectBackground.left}px`,
                    width: `${rect.width}px`,
                    height: `${rect.height}px`,
                    transition: '',
                });
            } else {
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
                        top: '15%',
                        left: `${rectBackground.left / 100 * 9}%`,
                        width: `${rect.width * 1.8}px `,
                        height: `${rect.height}px`,
                        transition: 'all .3s ease',
                    });
                }, 100);
            }
        } else {
            // document.body.style.overflow = "visible";
            // document.body.style.marginRight = "";
            if (isSafari()) {
                setImageStyles({
                    top: imageStylesMemory.top,
                    left: imageStylesMemory.left,
                    width: imageStylesMemory.width,
                    height: imageStylesMemory.height,
                    transition: 'all 0s ease',
                });
                setZoomImg(false);
                setZoomImgId("");
            } else {
                setImageStyles({
                    top: imageStylesMemory.top,
                    left: imageStylesMemory.left,
                    width: imageStylesMemory.width,
                    height: imageStylesMemory.height,
                    transition: 'all .3s ease',
                });
            }
            setBackgroundOpacity(true);
            setTimeout(() => {
                setZoomImg(false);
                setZoomImgId("");
            }, 500);
        }
    };

    const handleClickBack = () => {
        router.back();
    }

    return (
        !isMounted ? "" : (
            <div className='flex-1 ml-56 sm:ml-80 bg-light-background h-screen p-4 mt-14' >
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

                <div
                    className={styles.userFixedLayout}
                >
                    <div
                        className={`flex border-r-2 border-gray-200 items-center justify-center hover:bg-light-primary/20 hover:cursor-pointer ${styles.divIconBack}`}
                        onClick={(e) => {
                            abortFetch();
                            router.refresh();
                            setIsMounted(false);
                            dispatch(setModalIsOpen(false));
                            dispatch(stopGalleryLoading());
                            document.body.style.overflow = "visible"
                            router.back();
                        }}
                    >
                        <ChevronLeftIcon className='size-5' />
                    </div>
                    <div className='flex items-center w-full'>
                        <Image
                            src={cleanUrl(iconUser ? iconUser : `data:image/svg+xml;base64,${toBase64(grayShimmer(700, 475))}`)}
                            alt="User Icon"
                            width={60}
                            height={60}
                            loading="lazy"
                            className='border-2 border-light-primary/70'
                            style={{
                                borderRadius: "50%",
                                marginLeft: "2%",
                                width: "40px",
                                height: "40px",
                            }}
                        />
                        <h4 className='flex ml-3 w-full'>u/{redditUser}</h4>
                    </div>
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
                                                    src={cleanUrl(imgSource).replace(/\.(png|jpg|jpeg)$/, ".webp")}
                                                    alt={key}
                                                    width={550}
                                                    height={300}
                                                    loading="lazy"
                                                    sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 33vw"
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
                                                    placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
                                                />
                                                <Image
                                                    src={cleanUrl(imgSource).replace(/\.(png|jpg|jpeg)$/, ".webp")}
                                                    alt={key}
                                                    width={550}
                                                    height={300}
                                                    loading="lazy"
                                                    sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 33vw"
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
                                                    quality={1}
                                                // placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
                                                />
                                            </div>
                                        </div>
                                        <Image
                                            src={cleanUrl(imgSource).replace(/\.(png|jpg|jpeg)$/, ".webp")}
                                            alt={key}
                                            width={550}
                                            height={300}
                                            sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 33vw"
                                            loading="lazy"
                                            className={styles.image}
                                            placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
                                            quality={75}
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
            </div >
        )
    );
}