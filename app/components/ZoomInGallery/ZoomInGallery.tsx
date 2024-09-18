"use client";

import Image from 'next/image';
import styles from '@/app/styles/image.module.css';
import { useSearchParams, usePathname } from 'next/navigation';
import { shimmer, toBase64 } from '@/app/lib/utils/utils';
import { useRouter } from 'next/navigation';

import { useAppSelector } from '@/app/lib/hooks';
import { RootState } from '@/app/lib/store';


export default function ZoomInGallery({ params }: { params: { reddit: string, image: string } }) {
    const { reddit, image } = params;
    console.log(reddit, image);
    const posts = useAppSelector((state: RootState) => state.gallery.posts);

    const searchParams = useSearchParams();
    const pathname = usePathname()
    const imgUrl = searchParams.get('imgUrl');
    const keyUrl = ""

    console.log(pathname, keyUrl);

    const router = useRouter();

    const decodedImgUrl = imgUrl ? decodeURIComponent(imgUrl) : '';

    const handleImageZoomOut = () => {
        router.replace(`/r/${reddit}`, { scroll: false });
        setTimeout(() => {
            sessionStorage.removeItem("ZOOMED_IN")
        }, 200);
    };

    return (
        <div className='flex justify-center align-center content-center items-center w-full h-screen'>
            {decodedImgUrl && (
                <div className={styles.imgZoom} onClick={() => handleImageZoomOut()}>
                    <Image
                        src={decodedImgUrl}
                        alt="Zoomed Image"
                        width={650}
                        height={400}
                        className={styles.image}
                        priority
                        placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
                    />
                </div>
            )}
        </div>
    );
}
