"use client"

import { useState, useEffect } from "react";
import { searchReddit } from "@/lib/features/artLibrary/fetchData";
import Image from "next/image";

import styles from '@/app/styles/overview.module.css'

export default function Page({ params }: { params: { reddit: string } }) {
    const subReddit = "r/" + params.reddit;
    const [subRedditInfo, setSubredditInfo] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await searchReddit(subReddit);

                // Extrae el array de la propiedad 'data' del objeto recibido
                const data = result.data.children;

                console.log('Fetched data:', data); // Para debug

                if (Array.isArray(data)) {
                    setSubredditInfo(data);
                } else {
                    console.error("Data received is not an array:", data);
                }
            } catch (error) {
                console.error("Error searching Reddit:", error);
            }
        };

        fetchData();
    }, [subReddit]);

    return (
        <div className={`
        ${styles.galleryContainer}
        flex flex-wrap gap-4 p-4
        `}>
            {subRedditInfo.map((item, i) => {
                const preview = item.data.preview;
                const imgSource = preview?.images?.[0]?.source?.url;
                const uniqueKey = item.data.id || item.data.name;

                if (!imgSource) {
                    return null;
                }

                return (
                    <div key={i} className={styles.imageContainer}>
                        <Image 
                            src={imgSource} 
                            alt={uniqueKey} 
                            layout="responsive" // Adjusts the image size based on the container
                            width={800} // Example width
                            height={600} // Example height
                            className={styles.image}
                        />
                    </div>
                )
            })}
        </div>
    )
}
