"use client";

import styles from '@/app/styles/Gallery.module.css';

import { useState, useEffect, useRef } from "react";
import { fetchSubReddit } from "@/app/lib/features/artLibrary/fetchData";
import Image from "next/image";
import Masonry from "react-masonry-css";
import { useRouter } from "next/navigation";
import { shimmer, toBase64 } from "@/app/lib/utils/utils";
import { UserIcon } from "@heroicons/react/24/solid";
import { cleanUrl } from "@/app/lib/utils/utils";
import Link from 'next/link';
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";
import UserGallery from '../UserGallery/UserGallery';
import Modal from 'react-modal';

import { useAppSelector, useAppDispatch } from "@/app/lib/hooks";
import { RootState } from "@/app/lib/store";
import {
    setPosts, setLoadMorePosts, setBackgroundPosts,
    setLoading, setScrollPosition, setZoomedIn, setPastSubReddit, setAfter,
    setSelectedSubReddit, setModalisOpen
} from "@/app/lib/features/gallery/gallerySlice";
import { resetGallery } from '@/app/lib/features/userGallery/userGallerySlice';

Modal.setAppElement('#root');

interface RedditResponse {
    data: {
        children: Array<{ /* Define the structure of each post here */ }>;
        after: string | null;
    };
}

export default function Gallery({ params }: { params: { reddit: string } }) {
    const subReddit = params.reddit;

    const [sentinel, setSentinel] = useState(false);
    const [zoomImg, setZoomImg] = useState(false);
    const [zoomImgId, setZoomImgId] = useState<string | null>(null);
    const [backgroundOpacity, setBackgroundOpacity] = useState(false);
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

    // const [modalIsOpen, setIsOpen] = useState(false);
    const [authorSelected, setAuthorSelected] = useState<string | null>(null);


    function openModal() {
        dispatch(setModalisOpen(true));
    }

    function afterOpenModal() {
        // references are now sync'd and can be accessed.
    }

    function closeModal() {
        dispatch(setModalisOpen(false));
    }

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
        abortFetch();

        const signal = abortControllerRef.current?.signal;

        try {
            const result = await fetchSubReddit(subReddit, 25, '', '', signal) as RedditResponse;
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
        } catch (error) {
            if (error === "AbortError") {
                console.log("Request aborted");
            } else {
                console.error("Error fetching subreddit data:", error);
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
            const result = await fetchSubReddit(subReddit, 25, after, '', signal) as RedditResponse;
            const data = result.data.children;

            if (Array.isArray(data)) {
                dispatch(setBackgroundPosts(data))
                dispatch(setAfter(result.data.after));
            } else {
                console.error("Data received is not an array:", data);
            }
        } catch (error) {
            if (error === "AbortError") {
                console.log("Request aborted");
            } else {
                console.error("Error fetching subreddit after", error);
            }
        } finally {
            setSentinel(true);
            console.log("fetchDataAfterBackground finished");
        }
    }

    //Starter Effect
    ////////////////////////////////////////////////////////////////////////////
    useEffect(() => {
        if (isSafari()) {
            document.body.classList.add('isSafari');
            console.log("SAFARI")
        }

        if (posts.length === 0 || pastSubReddit !== selectedSubReddit) {
            dispatch(setSelectedSubReddit("r/" + subReddit));
            handleStartLoading();
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
            debounceRef.current = setTimeout(() => {
                fetchData();
                // window.scrollTo(0, scrollPosition);
            }, 100);

            return () => {
                if (debounceRef.current) {
                    clearTimeout(debounceRef.current);
                }
                abortFetch();
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
            abortFetch();

            const signal = abortControllerRef.current?.signal;

            try {
                const result = await fetchSubReddit(subReddit, 25, after, '', signal) as RedditResponse;
                const data = result.data.children;

                if (Array.isArray(data)) {
                    dispatch(setBackgroundPosts(data));
                    dispatch(setAfter(result.data.after));

                } else {
                    console.error("Data received is not an array:", data);
                }
            } catch (error) {
                if (error === "AbortError") {
                    console.log("Request aborted");
                } else {
                    console.error("Error fetching subreddit data:", error);
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
                        top: '10%',
                        left: `${rectBackground.left / 100 * 9}%`,
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

    // Handle user clicked
    ////////////////////////////////////////////////////////////////////////////////////////
    const handleUserClick = (e: any, author: string) => {
        e.stopPropagation();
        dispatch(setPastSubReddit("r/" + subReddit));
        dispatch(setScrollPosition(window.scrollY));
        console.log("SCROLL:", scrollPosition, window.scrollY);
        dispatch(resetGallery());
        // router.push(`/u/${author}`, { scroll: true })
    }

    return (
        <div className={`flex-1 ml-56 sm:ml-80 bg-light-background h-screen p-4`}>
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
                {authorSelected && <UserGallery params={{ user: authorSelected }} />}

            </Modal>

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
                                                width={550}
                                                height={300}
                                                loading="lazy"
                                                sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 33vw"
                                                className={`${styles.imageUnClicked} ${zoomImg ? styles.imageClicked : styles.imageUnClicked}`}
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
                                        width={550}
                                        height={300}
                                        loading="eager"
                                        sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 33vw"
                                        className={styles.image}
                                        placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
                                        quality={75}
                                    />
                                </div>
                                <div className={styles.gradientOverlay}></div>
                                <div className={styles.titleOverlay}>
                                    <i>
                                        <UserIcon className="size-4" />
                                    </i>
                                    {/* <Link href={`/u/${author}`} onClick={(e) => handleUserClick(e, author)}> */}
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
    );
}