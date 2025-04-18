"use client";

import styles from '@/public/styles/Gallery.module.css';

import { useState, useEffect, useRef } from "react";
import { fetchUserReddit } from '@/app/assets/lib/artLibrary/fetchData';
import { fetchUserIcon } from '@/app/assets/lib/artLibrary/fetchData';
import Image from "next/image";
import Masonry from "react-masonry-css";
import { useRouter } from "next/navigation";
import { shimmer, darkShimmer, toBase64 } from "@/app/assets/lib/utils/utils";
import { ChevronUpDownIcon, UserIcon } from "@heroicons/react/24/solid";
import { cleanUrl } from "@/app/assets/lib/utils/utils";
import { grayShimmer } from '@/app/assets/lib/utils/utils';
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";
import { grayShimmerIcon } from '@/app/assets/lib/utils/utils';
import { ChevronLeftIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { setClickedNav, setIsMobile } from '@/app/assets/store/slices/mobileSlice/mobileSlice';
import { usePathname } from 'next/navigation';
import Skeleton from 'react-loading-skeleton';
import Link from 'next/link';

import { useAppSelector, useAppDispatch } from "@/app/assets/store/hooks";
import { RootState } from "@/app/assets/store/store";
import {
    setPosts, setLoadMorePosts, setBackgroundPosts,
    setLoading, setScrollPosition, resetGallery, stopGalleryLoading,
} from "@/app/assets/store/slices/userGallerySlice/userGallerySlice"
import { setUserClicked } from '@/app/assets/store/slices/mobileSlice/mobileSlice';
import { setModalIsOpen, setSelectedSubReddit } from '@/app/assets/store/slices/gallerySlice/gallerySlice';

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
    const pathname = usePathname();
    const hasUPath = pathname.includes("/u");

    const [isMounted, setIsMounted] = useState(false);

    const [sentinel, setSentinel] = useState(false);
    const [after, setAfter] = useState<string | null>(null);
    const [zoomImg, setZoomImg] = useState(false);
    const [zoomImgId, setZoomImgId] = useState<string | null>(null);
    const [iconUser, setIconUser] = useState<string | null>(null);
    const [backgroundOpacity, setBackgroundOpacity] = useState(false);
    const [isMobileImageClicked, setIsMobileImageClicked] = useState(false);
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
    const isMobile = useAppSelector((state: RootState) => state.mobile.isMobile);
    const isNotDesktop = useAppSelector((state: RootState) => state.mobile.isNotDesktop);
    const clickedNav = useAppSelector((state: RootState) => state.mobile.clickedNav);
    const isDarkTheme= useAppSelector((state: RootState) => state.theme.isDarkTheme);
    const dispatch = useAppDispatch();

    const sentinelRef = useRef(null);
    const loadingBarRef = useRef<LoadingBarRef>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setIsMounted(true);

        return () => {
            setIsMounted(false);
        };
    }, []);

    function isSafari() {
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    }

    function isFirefox() {
        return /firefox|fxios/i.test(navigator.userAgent);
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



    //Function to Fetch Data
    ////////////////////////////////////////////////////////////////////////////
    const fetchData = async (afterParam = '') => {
        dispatch(setLoading(true));

        try {
            const result = await fetchUserReddit(redditUser, isMobile || isNotDesktop ? 15 : 50, '', '') as RedditResponse;
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

        try {
            const result = await fetchUserReddit(redditUser, isMobile || isNotDesktop ? 7 : 50, after, '') as RedditResponse;
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

        try {
            const result = await fetchUserIcon(redditUser) as IconResponse;

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
        if (hasUPath) {
            dispatch(setSelectedSubReddit(null));
        }
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
            };
        }
    }, [redditUser]);

    //Sentinel Effect to Load More pictures automatically when scrolling down, depends on sentinel view
    ////////////////////////////////////////////////////////////////////////////////////////
    useEffect(() => {
        const fetchDataAfterBackgroundEffect = async () => {
            if (!after) return;

            try {
                const result = await fetchUserReddit(redditUser, isMobile || isNotDesktop ? 7 : 50, after, '') as RedditResponse;
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
                    // console.log('Sentinel is in view');
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

            if (isSafari() || isFirefox()) {
                setImageStyles({
                    top: '15%',
                    left: `${(rectBackground.right - rectBackground.left) - (rectBackground.right / 1.78)}px`,
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
                        left: `${(rectBackground.right - rectBackground.left) - (rectBackground.right / 1.78)}px`,
                        width: `${rect.width * 1.8}px `,
                        height: `${rect.height}px`,
                        transition: 'all .3s ease',
                    });
                }, 100);
            }
        } else {
            // document.body.style.overflow = "visible";
            // document.body.style.marginRight = "";
            if (isSafari() || isFirefox()) {
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

    const handleClickBack = (e: any) => {
        if (hasUPath && !clickedNav) {
            router.push("/");
        } else if (hasUPath && clickedNav) {
            dispatch(setClickedNav(false));
        } else {
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ action: 'cancelPendingRequests' });
                // console.log("ABORT")
            } else {
                console.log('No active Service Worker to send message to.');
            }
            router.back();
            setIsMounted(false);
            dispatch(setModalIsOpen(false));
            dispatch(setUserClicked(false));
            dispatch(stopGalleryLoading());
            document.body.style.overflow = "visible"
        }
    }

    // Effect to control backward button
    useEffect(() => {
        const handlePopState = () => {
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ action: 'cancelPendingRequests' });
            } else {
                console.log('No active Service Worker to send message to.');
            }
            setIsMounted(false);
            dispatch(setUserClicked(false));
            dispatch(setModalIsOpen(false));
            dispatch(stopGalleryLoading());
            document.body.style.overflow = "visible";
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [clickedImageIndex, setClickedImageIndex] = useState<number | null>(null);

    const breakpointColumnsObj = isMobileImageClicked
        ? { default: 1, 1600: 1, 1400: 2, 1000: 1 }
        : { default: 5, 1600: 4, 1400: 3, 1000: 2 };


    return (
        !isMounted ? "" : (
            <div className={`
            flex-1 ml-0 sm:ml-80 mt-14 sm:mt-0 h-screen p-4 sm:pt-16
            ${isDarkTheme ? "bg-dark-background text-white" : "bg-light-background"}
            `} >
                <div>
                    <LoadingBar
                        color={`${isDarkTheme ? "#a855f7" : "#00BFFF"}`}
                        ref={loadingBarRef}
                        height={4}
                        className={styles.loadingBar}
                        shadow={false}
                    // onLoaderFinished={() => console.log("Loader finished")} 
                    />
                </div>

                <div
                    className={isDarkTheme ? styles.userFixedLayoutDark : styles.userFixedLayout}
                >
                    <div
                        className={`
                            flex items-center justify-center hover:bg-light-primary/20 hover:cursor-pointer ${styles.divIconBack}
                            ${isDarkTheme ? "hover:bg-purple-500/50" : "hover:bg-light-primary/20"}
                        `}
                        onClick={(e) => {
                            handleClickBack(e)
                        }}
                    >
                        <ChevronLeftIcon className='size-5' />
                    </div>
                    <div className='flex items-center w-full'>
                        <Image
                            src={cleanUrl(iconUser ? iconUser : `data:image/svg+xml;base64,${toBase64(grayShimmerIcon())}`)}
                            alt="User Icon"
                            width={60}
                            height={60}
                            priority={true}
                            className={isDarkTheme ? styles.iconUserBorderDark : styles.iconUserBorder}
                            style={{
                                borderRadius: "50%",
                                marginLeft: "5px",
                                width: "40px",
                                height: "40px",
                            }}
                        />
                        <h4 className='flex ml-3 w-full'>u/{redditUser}</h4>
                    </div>
                </div>

                <>
                    <Masonry
                        breakpointCols={breakpointColumnsObj}
                        className={styles.masonryGrid}
                        columnClassName={styles.masonryGridColumn}
                    >
                        {Array.isArray(posts) && posts.map((item, index) => {
                            const preview = item.data.preview;
                            const imgSource = isMobile || isNotDesktop ? preview?.images?.[0]?.resolutions[3]?.url : preview?.images?.[0]?.resolutions[4]?.url;
                            const width = isMobile || isNotDesktop ? preview?.images?.[0]?.resolutions[3]?.width : preview?.images?.[0]?.resolutions[4]?.width;
                            const height = isMobile || isNotDesktop ? preview?.images?.[0]?.resolutions[3]?.height : preview?.images?.[0]?.resolutions[4]?.height;
                            const alt = item.data.title
                            const key = item.data.id + index
                            const author = item.data.author;

                            if (!imgSource) {
                                return null;
                            }

                            return (
                                <div key={key}>
                                    {isMobile || isNotDesktop ? (
                                        <div
                                            className={`${styles.imageContainer}`}
                                            ref={(el) => (imageRefs.current[index] = el)}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsMobileImageClicked(prev => !prev);
                                                setClickedImageIndex(index);


                                                setTimeout(() => {
                                                    imageRefs.current[index]?.scrollIntoView({
                                                        behavior: 'instant',
                                                        inline: 'center',
                                                        block: 'center'
                                                    });
                                                }, 0);
                                            }}
                                        >
                                            <Image
                                                src={cleanUrl(imgSource).replace(/\.(png|jpg|jpeg)$/, ".webp")}
                                                alt={alt}
                                                width={width}
                                                height={height}
                                                priority={true}
                                                sizes="(max-width: 12800px) 100vw"
                                                placeholder={isDarkTheme 
                                                    ? `data:image/svg+xml;base64,${toBase64(darkShimmer(700, 475))}` 
                                                    : `data:image/svg+xml;base64,${toBase64(grayShimmer(700, 475))}`
                                                }
                                                onError={(e) => {
                                                    e.currentTarget.className = 'hidden'
                                                }}
                                                style={{
                                                    borderRadius: "20px",
                                                    // width: "100%",
                                                    height: "auto",
                                                    objectFit: "cover",
                                                }}
                                            // blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
                                            />
                                            {isMobileImageClicked ? (
                                                // <div className={styles.titleOverlayMobile}>
                                                //     <i>
                                                //         <UserIcon className="size-4" />
                                                //     </i>
                                                //     <span
                                                //         className="ml-3"
                                                //         onClick={(e) => {
                                                //             e.stopPropagation()

                                                //             document.body.style.overflow = "hidden";
                                                //             router.push(`?user=${author}`, { scroll: false })

                                                //         }}
                                                //     >
                                                //         {"u/" + author}
                                                //     </span>
                                                // </div>
                                                ""
                                            ) : (
                                                ""
                                            )}
                                        </div>

                                    ) : (
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
                                                            alt={alt}
                                                            width={width}
                                                            height={height}
                                                            priority={true}
                                                            className={`${styles.imageUnClicked} ${zoomImg ? isDarkTheme ? styles.imageClickedDark : styles.imageClicked : styles.imageUnClicked}`}
                                                            placeholder={isDarkTheme 
                                                                ? `data:image/svg+xml;base64,${toBase64(darkShimmer(700, 475))}` 
                                                                : `data:image/svg+xml;base64,${toBase64(grayShimmer(700, 475))}`
                                                            }
                                                            onError={(e) => {
                                                                e.currentTarget.className = 'hidden'
                                                                // e.currentTarget.src = '/path/to/placeholder.jpg' // line to replace the src.
                                                            }}
                                                            style={{
                                                                top: `${imageStyles.top}`,
                                                                left: `${imageStyles.left}`,
                                                                width: `${imageStyles.width}`,
                                                                height: "auto",
                                                                transform: 'scale(1)',
                                                                position: 'absolute',
                                                                zIndex: 1000,
                                                                transition: `${imageStyles.transition}`,
                                                                padding: '0px',
                                                                borderRadius: '20px',
                                                            }}
                                                        />
                                                        <Image
                                                            src={cleanUrl(imgSource).replace(/\.(png|jpg|jpeg)$/, ".webp")}
                                                            alt={alt}
                                                            width={width}
                                                            height={height}
                                                            loading="lazy"
                                                            className={`${styles.imageUnClicked} ${zoomImg ? styles.imageClickedBackground : styles.imageUnClicked}`}
                                                            onError={(e) => {
                                                                e.currentTarget.className = 'hidden'
                                                                // e.currentTarget.src = '/path/to/placeholder.jpg' // line to replace the src.
                                                            }}
                                                            style={{
                                                                top: `${imageStyles.top}`,
                                                                left: `${imageStyles.left}`,
                                                                width: `${imageStyles.width}`,
                                                                height: "auto",
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
                                                    alt={alt}
                                                    width={width}
                                                    height={height}
                                                    priority={true}
                                                    placeholder={isDarkTheme 
                                                        ? `data:image/svg+xml;base64,${toBase64(darkShimmer(700, 475))}` 
                                                        : `data:image/svg+xml;base64,${toBase64(grayShimmer(700, 475))}`
                                                    }
                                                    onError={(e) => {
                                                        e.currentTarget.className = 'hidden'
                                                    }}
                                                // blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
                                                />
                                            </div>
                                            <div className={styles.gradientOverlay}></div>
                                            {/* <div className={styles.titleOverlay}>
                                                <i>
                                                    <UserIcon className="size-4" />
                                                </i>
                                                <span
                                                    className="ml-3"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        document.body.style.overflow = "hidden";
                                                        router.push(`?user=${author}`, { scroll: false })
                                                    }}
                                                >
                                                    {"u/" + author}
                                                </span>
                                            </div> */}

                                        </div>
                                    )}
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