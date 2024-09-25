import Image from "next/image"
import mockup from "@/public/mockup3.jpg"

import styles from "@/app/styles/landing.module.css"


export default function Landing() {
    return (
        <>
            <div className={`flex bg-light-background h-screen justify-center w-screen`}>
                <div className="flex ml-56 sm:ml-80 w-full justify-center overflow-hidden p-10">
                    <Image
                        src={mockup}
                        alt="Macbook Pro mockup with landing page"
                        width={550}
                        height={300}
                        className={`${styles.landingImage} shadow-xl`}
                        loading="eager"
                        priority={true}
                        placeholder="blur"
                        // style={{
                        //     minWidth: '550px',
                        //     minHeight: '300px', 
                        //     objectFit: 'cover', 
                        //     overflow: 'visible' 
                        // }}
                    // sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 33vw"
                    // className={styles.image}
                    // placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
                    />
                </div>
            </div>
        </>
    )
};