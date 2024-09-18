"use client";

import Image from 'next/image';
import styles from '@/app/styles/image.module.css';
import { useSearchParams } from 'next/navigation';
import { shimmer, toBase64 } from '@/app/lib/utils/utils';
import { useRouter } from 'next/navigation';


export default function ZoomInGallery({ params }: { params: { reddit: string } }) {
    const { reddit } = params;
    const searchParams = useSearchParams();
    const imgUrl = searchParams.get('imgUrl');
    console.log(imgUrl);

    const router = useRouter();

    const decodedImgUrl = imgUrl ? decodeURIComponent(imgUrl) : '';

    const handleImageZoomOut = () => {
        router.replace(`/r/${reddit}`, { scroll: false });
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
