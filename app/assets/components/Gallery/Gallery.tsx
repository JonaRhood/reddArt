
"use client";

import styles from '@/public/styles/Gallery.module.css';

import { useState, useEffect, useRef } from "react";
import { fetchSubReddit } from "@/app/assets/lib/artLibrary/fetchData";
import Image from "next/image";
import Masonry from "react-masonry-css";
import { Suspense } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { shimmer, grayShimmer, darkShimmer, toBase64 } from "@/app/assets/lib/utils/utils";
import { UserIcon } from "@heroicons/react/24/solid";
import { cleanUrl } from "@/app/assets/lib/utils/utils";
import Link from 'next/link';
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";
import UserGallery from '../UserGallery/UserGallery';
import Modal from 'react-modal';
import { useInView } from 'react-intersection-observer';

import { useAppSelector, useAppDispatch } from "@/app/assets/store/hooks";
import { RootState } from "@/app/assets/store/store";
import {
    setPosts, setLoadMorePosts, setBackgroundPosts,
    setLoading, setScrollPosition, setZoomedIn, setPastSubReddit, setAfter,
    setSelectedSubReddit, setModalIsOpen
} from "@/app/assets/store/slices/gallerySlice/gallerySlice";
import { setUserClicked } from '@/app/assets/store/slices/mobileSlice/mobileSlice';
import { resetGallery } from '@/app/assets/store/slices/userGallerySlice/userGallerySlice';
import { current } from '@reduxjs/toolkit';
import { setIsMobile, setClickedNav } from '@/app/assets/store/slices/mobileSlice/mobileSlice';

Modal.setAppElement('#root');

interface RedditResponse {
    data: {
        children: Array<{
            data: {
                title: string;
                url: string;
                author: string;
                id: string;
                preview: {
                    images: Array<{
                        resolutions: Array<{
                            url: string
                        }>;
                    }>;
                }
            }
        }>;
        after: string | null;
    };
}

export default function Gallery({ params }: { params: { reddit: string } }) {
    const subReddit = params.reddit;
    const searchParams = useSearchParams();
    const user = searchParams.get('user');

    const [sentinel, setSentinel] = useState(false);
    const [zoomImg, setZoomImg] = useState(false);
    const [zoomImgId, setZoomImgId] = useState<string | null>(null);
    const [backgroundOpacity, setBackgroundOpacity] = useState(false);
    const [imageIsError, setImageIsError] = useState(false);
    const [isMobileImageClicked, setIsMobileImageClicked] = useState(false);
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

    const posts = useAppSelector((state: RootState) => state.gallery.posts);
    const loading = useAppSelector((state: RootState) => state.gallery.loading);
    const selectedSubReddit = useAppSelector((state: RootState) => state.gallery.selectedSubReddit);
    const scrollPosition = useAppSelector((state: RootState) => state.gallery.scrollPosition);
    const pastSubReddit = useAppSelector((state: RootState) => state.gallery.pastSubReddit);
    const zoomedIn = useAppSelector((state: RootState) => state.gallery.zoomedIn);
    const modalIsOpen = useAppSelector((state: RootState) => state.gallery.modalIsOpen);
    const after = useAppSelector((state: RootState) => state.gallery.after);
    const isMobile = useAppSelector((state: RootState) => state.mobile.isMobile);
    const isNotDesktop = useAppSelector((state: RootState) => state.mobile.isNotDesktop);
    const userClicked = useAppSelector((state: RootState) => state.mobile.userClicked);
    const isDarkTheme= useAppSelector((state: RootState) => state.theme.isDarkTheme);
    const dispatch = useAppDispatch();

    const sentinelRef = useRef(null);
    const loadingBarRef = useRef<LoadingBarRef>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    function isSafari() {
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    }

    function isFirefox() {
        return /firefox|fxios/i.test(navigator.userAgent);
    }

    const handleStartLoading = () => {
        if (loadingBarRef.current) {
            loadingBarRef.current.continuousStart();
        }
    };

    const handleCompleteLoading = () => {
        if (loadingBarRef.current) {
            loadingBarRef.current.complete();
        }
    };
    const [authorSelected, setAuthorSelected] = useState<string | null>(null);


    function openModal() {
        dispatch(setModalIsOpen(true));
    }

    function afterOpenModal() {
        // references are now sync'd and can be accessed.
    }

    function closeModal() {
        dispatch(setModalIsOpen(false));
    }

    //Function to Fetch Data
    ////////////////////////////////////////////////////////////////////////////
    const fetchData = async (afterParam = '') => {
        dispatch(setLoading(true));

        try {
            const result = await fetchSubReddit(subReddit, isMobile || isNotDesktop ? 15 : 50, '', '') as RedditResponse;

            if (result && result.data) {
                const data = result.data.children;

                if (Array.isArray(data)) {
                    dispatch(setPosts(data));
                    dispatch(setAfter(result.data.after));
                    const after = result.data.after;
                    if (after) {
                        fetchDataAfterBackground(after);
                    }
                } else {
                    console.error("Data received is not an array:", data);
                }
            } else {
                // console.warn("Result or result.data is null:", result);
            }
        } catch (error: unknown) {
            if (error instanceof TypeError) {
            } else if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    console.log('Fetch aborted');
                } else {
                    // console.error('Fetch Error:', error);
                }
            }
        } finally {
            dispatch(setLoading(false));
            handleCompleteLoading();
        }
    };

    //Function to Fetch After Data on the backround
    ////////////////////////////////////////////////////////////////////////////
    const fetchDataAfterBackground = async (after: string) => {
        if (!after) return;

        try {
            const result = await fetchSubReddit(subReddit, isMobile || isNotDesktop ? 7 : 50, after, '') as RedditResponse;
            const data = result.data.children;

            if (Array.isArray(data)) {
                dispatch(setBackgroundPosts(data))
                dispatch(setAfter(result.data.after));
            } else {
                console.error("Data received is not an array:", data);
            }
        } catch (error: unknown) {
            if (error instanceof TypeError) {
            } else if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    console.log('Fetch aborted');
                } else {
                    // console.error('Fetch Error:', error);
                }
            }
        } finally {
            setSentinel(true);
        }
    }

    //Starter Effect
    ////////////////////////////////////////////////////////////////////////////
    useEffect(() => {
        if (isSafari() || isFirefox()) {
            document.body.classList.add('isSafari');
        }
        setTimeout(() => {
            if (isMobile || isNotDesktop) {
                window.scrollTo(0, 0);
                document.body.scrollTop = 0;
                document.documentElement.scrollTop = 0;
            }
        }, 50)
        if (user) {
            router.push(`/u/${user}`);
        }

        if (posts.length === 0 || pastSubReddit !== selectedSubReddit) {
            dispatch(setSelectedSubReddit("r/" + subReddit));
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
            debounceRef.current = setTimeout(() => {
                if (localStorage.getItem("USER_CLICKED") === "true") {
                    localStorage.removeItem("USER_CLICKED");
                    setSentinel(true);
                    return;
                } else {
                    handleStartLoading();
                    fetchData();
                }
            }, 100);

            return () => {
                if (debounceRef.current) {
                    clearTimeout(debounceRef.current);
                }
            };
        } else {
            setSentinel(true);
        }
    }, [subReddit]);

    //Sentinel Effect to Load More pictures automatically when scrolling down, depends on sentinel view
    ////////////////////////////////////////////////////////////////////////////////////////
    useEffect(() => {
        const fetchDataAfterBackgroundEffect = async () => {
            if (!after) return;

            try {
                const result = await fetchSubReddit(subReddit, isMobile || isNotDesktop ? 7 : 50, after, '') as RedditResponse;
                const data = result.data.children;

                if (Array.isArray(data)) {
                    dispatch(setBackgroundPosts(data));
                    dispatch(setAfter(result.data.after));
                } else {
                    console.error("Data received is not an array:", data);
                }
            } catch (error: unknown) {
                if (error instanceof TypeError) {
                } else if (error instanceof Error) {
                    if (error.name === 'AbortError') {
                        console.log('Fetch aborted');
                    } else {
                        // console.error('Fetch Error:', error);
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
            dispatch(setZoomedIn(true));

            const rect = e.target.getBoundingClientRect();
            isNotDesktop ? null : document.body.style.overflow = "hidden";
            isNotDesktop ? null : document.body.style.marginRight = "15px";

            const target = e.currentTarget;
            const childDiv = target.querySelector(`.${styles.divContainerImgClicked}`);

            const rectBackground = childDiv.getBoundingClientRect();

            if (isSafari() || isFirefox()) {
                setImageStyles({
                    top: '10%',
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
                        top: '10%',
                        left: `${(rectBackground.right - rectBackground.left) - (rectBackground.right / 1.78)}px`,
                        width: `${rect.width * 1.8}px `,
                        height: `${rect.height}px`,
                        transition: 'all .3s ease',
                    });
                }, 100);
            }
        } else {
            isNotDesktop ? null : document.body.style.overflow = "visible";
            isNotDesktop ? null : document.body.style.marginRight = "";
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
            dispatch(setZoomedIn(false));
            setTimeout(() => {
                setZoomImg(false);
                setZoomImgId("");
            }, 350);
        }
    };

    // Effect to allow back and forward between Gallery and userGallery Modal
    const [previousHistoryLength, setPreviousHistoryLenght] = useState<number>(0);
    const [currentHistoryLength, setCurrentHistoryLenght] = useState<number>(0);

    useEffect(() => {

        const handlePopState = () => {
            const currentWidth = window.innerWidth;

            if (previousHistoryLength < currentHistoryLength) {
                if (currentWidth <= 640 || isNotDesktop) {
                    dispatch(setIsMobile(true));
                }
                // dispatch(setUserClicked(true));
                dispatch(setModalIsOpen(true));
                document.body.style.overflow = "hidden";

                setCurrentHistoryLenght(currentHistoryLength - 1)

            } else if (previousHistoryLength === currentHistoryLength) {
                setCurrentHistoryLenght(currentHistoryLength + 1)
            }
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [previousHistoryLength, currentHistoryLength]);

    //Effect to add an event listener to check the window size and detect mobile devices
    useEffect(() => {
        const handleResize = () => {
            const currentWidth = window.innerWidth;
            if (!modalIsOpen && currentWidth <= 640 || !modalIsOpen && isNotDesktop) {
                // console.log("MODAL OPEN", modalIsOpen);
                dispatch(setIsMobile(true));
                dispatch(setUserClicked(false));
            } else if (modalIsOpen && currentWidth <= 640 || modalIsOpen && isNotDesktop) {
                // console.log("MODAL CLOSED", modalIsOpen);
                dispatch(setIsMobile(true));
                dispatch(setUserClicked(true));
                if (modalIsOpen && currentWidth > 640) {
                    dispatch(setUserClicked(false));
                }
            } else {
                dispatch(setIsMobile(false));
                setIsMobileImageClicked(false);
                dispatch(setUserClicked(false));
            }
        }

        window.addEventListener('resize', handleResize);

        handleResize();
    }, [modalIsOpen])

    const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [clickedImageIndex, setClickedImageIndex] = useState<number | null>(null);

    const breakpointColumnsObj = isMobileImageClicked
        ? { default: 1, 1600: 1, 1400: 2, 1000: 1 }
        : { default: 5, 1600: 4, 1400: 3, 1000: 2 };

    return (
        // !isMounted ? "" : (
        <div className={`
        flex-1 ml-0 sm:ml-80 mt-14 sm:mt-0 h-screen p-4
        ${isDarkTheme ? "text-white" : ""}
        ${isDarkTheme ? styles.scrollDark : styles.scroll}
        `}>
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

            <Modal
                isOpen={modalIsOpen}
                onAfterOpen={afterOpenModal}
                onRequestClose={closeModal}
                className={isDarkTheme ? styles.modalDark : styles.modal}
                shouldCloseOnEsc={true}
                preventScroll={true}
            >
                {authorSelected && <Suspense fallback={null}><UserGallery params={{ user: authorSelected }} /></Suspense>}

            </Modal>

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
                        const author = item.data.author === "[deleted]" ? "deleted" : item.data.author;

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
                                            setIsMobileImageClicked(prev => !prev); // Establece el estado de la imagen clickeada
                                            setClickedImageIndex(index); // Guarda el índice de la imagen clickeada

                                            // Desplazamiento hacia la imagen clickeada
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
                                                // width: "100vw",
                                                height: "auto",
                                                objectFit: "cover",
                                            }}
                                        // blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
                                        />
                                        {isMobileImageClicked ? (
                                            <div className={styles.titleOverlayMobile}>
                                                <i>
                                                    <UserIcon className="size-4" />
                                                </i>
                                                <span
                                                    className="ml-3"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        openModal();
                                                        document.body.style.overflow = "hidden";
                                                        router.push(`?user=${author}`, { scroll: false })
                                                        setAuthorSelected(author);
                                                        dispatch(setUserClicked(true));
                                                        setCurrentHistoryLenght(0);
                                                    }}
                                                >
                                                    {"u/" + author}
                                                </span>
                                            </div>

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
                                                className={`
                                                    ${styles.divContainerImgClicked} ${zoomImgId === key ? styles.divContainerImgClickedActive : styles.divContainerImgClicked} 
                                                    ${backgroundOpacity ? styles.divContainerImgClickedOpacity : ""}
                                                    ${isDarkTheme ? styles.divContainerImgClickedDark : styles.divContainerImgClicked}
                                                    `}
                                            >
                                                <div className={styles.divImgClicked}>

                                                    <Image
                                                        src={cleanUrl(imgSource).replace(/\.(png|jpg|jpeg)$/, ".webp")}
                                                        alt={alt}
                                                        width={width}
                                                        height={height}
                                                        className={`${styles.imageUnClicked} ${zoomImg ? isDarkTheme ? styles.imageClickedDark : styles.imageClicked : styles.imageUnClicked}`}
                                                        priority={true}
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
                                        <div className={styles.titleOverlay}>
                                            <i onClick={(e) => e.stopPropagation()}>
                                                <UserIcon className="size-4" />
                                            </i>
                                            <span
                                                className="ml-3"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    openModal();
                                                    document.body.style.overflow = "hidden";
                                                    router.push(`?user=${author}`, { scroll: false })
                                                    setAuthorSelected(author);
                                                    setCurrentHistoryLenght(0);
                                                }}
                                            >
                                                <p>{"u/" + author}</p>
                                            </span>
                                        </div>

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
        </div>
    )
    // );
}
