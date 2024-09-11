"use client"

import { useState,useEffect } from "react";
import { searchReddit } from "@/lib/features/artLibrary/fetchData";
import Image from "next/image";


export default function Page({ params }: { params: { reddit:string } }) {
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
        <div>
            {subRedditInfo.map((item, i) => {
                const preview = item.data.preview;
                const imgSource = preview?.images?.[0]?.source?.url;
                

                console.log(imgSource);

                return (
                    <div key={i}>
                        <Image src={imgSource} alt={imgSource} width={50} height={30}/>
                    </div>
                )
            })};
        </div>
    )
}