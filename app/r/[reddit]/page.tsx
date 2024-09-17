"use client";

import Gallery from "@/app/components/Gallery/Gallery";
import { Suspense, useRef } from "react";
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";

export default function Page({ params }: { params: { reddit: string } }) {


    return (
        <>
            <Suspense>
                <Gallery params={params} />
            </Suspense>
        </>
    );
}
