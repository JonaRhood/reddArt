
"use client";

import styles from '@/public/styles/Gallery.module.css';

import { useState, useEffect, useRef } from "react";
import { fetchSubReddit } from "@/app/lib/features/artLibrary/fetchData";
import Image from "next/image";
import Masonry from "react-masonry-css";
import { Suspense } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { shimmer, grayShimmer, toBase64 } from "@/app/lib/utils/utils";
import { UserIcon } from "@heroicons/react/24/solid";
import { cleanUrl } from "@/app/lib/utils/utils";
import Link from 'next/link';
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";
import UserGallery from '../UserGallery/UserGallery';
import Modal from 'react-modal';
import { useInView } from 'react-intersection-observer';

import { useAppSelector, useAppDispatch } from "@/app/lib/hooks";
import { RootState } from "@/app/lib/store";
import {
    setPosts, setLoadMorePosts, setBackgroundPosts,
    setLoading, setScrollPosition, setZoomedIn, setPastSubReddit, setAfter,
    setSelectedSubReddit, setModalIsOpen
} from "@/app/lib/features/gallery/gallerySlice";
import { resetGallery } from '@/app/lib/features/userGallery/userGallerySlice';

Modal.setAppElement('#root');

interface RedditResponse {
    data: {
        children: Array<{
            data: {
                title: string;
                url: string;
                author: string;
                id: string;
                // Add other fields as necessary
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
    const dispatch = useAppDispatch();

    const sentinelRef = useRef(null);
    const loadingBarRef = useRef<LoadingBarRef>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    function isSafari() {
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
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
            const result = await fetchSubReddit(subReddit, 10, '', '') as RedditResponse;

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
            const result = await fetchSubReddit(subReddit, 10, after, '') as RedditResponse;
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
        if (isSafari()) {
            document.body.classList.add('isSafari');
        }
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
                    console.log("LLEGADO AQUI")
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
                const result = await fetchSubReddit(subReddit, 10, after, '') as RedditResponse;
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

    // Handle Zoom, transition and animation when Image is clicked
    ////////////////////////////////////////////////////////////////////////////////////////
    const handleImageZoom = (e: any, key: string) => {
        if (zoomImg === false) {
            setBackgroundOpacity(false);
            setZoomImg(true);
            setZoomImgId(key);
            dispatch(setZoomedIn(true));
            const rect = e.target.getBoundingClientRect();
            document.body.style.overflow = "hidden";
            document.body.style.marginRight = "15px";

            const target = e.currentTarget;
            const childDiv = target.querySelector(`.${styles.divContainerImgClicked}`);

            const rectBackground = childDiv.getBoundingClientRect();

            if (isSafari()) {
                setImageStyles({
                    top: '10%',
                    left: `${rectBackground.left / 10}%`,
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
                        left: `${rectBackground.left / 10}%`,
                        width: `${rect.width * 1.8}px `,
                        height: `${rect.height}px`,
                        transition: 'all .3s ease',
                    });
                }, 100);
            }
        } else {
            document.body.style.overflow = "visible";
            document.body.style.marginRight = "";
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
            dispatch(setZoomedIn(false));
            setTimeout(() => {
                setZoomImg(false);
                setZoomImgId("");
            }, 350);
        }
    };

    return (
        // !isMounted ? "" : (
        <div className={`flex-1 ml-0 sm:ml-80 mt-14 sm:mt-0 bg-light-background h-screen p-4`}>
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

            <Modal
                isOpen={modalIsOpen}
                onAfterOpen={afterOpenModal}
                onRequestClose={closeModal}
                className={styles.modal}
                shouldCloseOnEsc={true}
                preventScroll={true}
            >
                {authorSelected && <Suspense fallback={null}><UserGallery params={{ user: authorSelected }} /></Suspense>}

            </Modal>

            <>
                <Masonry
                    breakpointCols={{ default: 5, 1600: 4, 1400: 3, 1000: 2 }}
                    className={styles.masonryGrid}
                    columnClassName={styles.masonryGridColumn}
                >
                    {Array.isArray(posts) && posts.map((item, index) => {
                        const preview = item.data.preview;
                        const imgSource = preview?.images?.[0]?.source?.url;
                        const key = item.data.id + index
                        const author = item.data.author === "[deleted]" ? "deleted" : item.data.author;

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
                                                    width={preview?.images?.[0]?.source?.width}
                                                    height={preview?.images?.[0]?.source?.height}                                                  
                                                    priority={true}
                                                    className={`${styles.imageUnClicked} ${zoomImg ? styles.imageClicked : styles.imageUnClicked}`}
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                                                    placeholder={`data:image/svg+xml;base64,${toBase64(grayShimmer(700, 475))}`}
                                                />
                                                <Image
                                                    src={cleanUrl(imgSource).replace(/\.(png|jpg|jpeg)$/, ".webp")}
                                                    alt={key}
                                                    width={preview?.images?.[0]?.source?.width}
                                                    height={preview?.images?.[0]?.source?.height}
                                                    loading="lazy"
                                                    className={`${styles.imageUnClicked} ${zoomImg ? styles.imageClickedBackground : styles.imageUnClicked}`}
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                                        alt={key}
                                        width={preview?.images?.[0]?.source?.width}
                                        height={preview?.images?.[0]?.source?.height}
                                        priority={true}
                                        placeholder={`data:image/svg+xml;base64,${toBase64(grayShimmer(700, 475))}`}
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        onError={(e) => {
                                            e.currentTarget.className = 'hidden'
                                            // e.currentTarget.src = '/path/to/placeholder.jpg' // line to replace the src.
                                        }}
                                    // blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
                                    // style={{
                                    //     backgroundColor: "lightgray"
                                    // }}
                                    />
                                </div>
                                <div className={styles.gradientOverlay}></div>
                                <div className={styles.titleOverlay}>
                                    <i>
                                        <UserIcon className="size-4" />
                                    </i>
                                    {/* <Link href={`/u/${author}`} scroll={true} onClick={(e) => {
                                        e.stopPropagation();
                                        setAuthorSelected(author);
                                        localStorage.setItem("USER_CLICKED", "true");
                                    }}> */}
                                    <span
                                        className="ml-3"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            openModal();
                                            document.body.style.overflow = "hidden";
                                            router.push(`?user=${author}`, { scroll: false })
                                            setAuthorSelected(author);
                                        }}
                                    >
                                        {"u/" + author}
                                    </span>
                                    {/* </Link> */}
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
    )
    // );
}
