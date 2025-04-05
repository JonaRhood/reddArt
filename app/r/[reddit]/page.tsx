"use client";

export const runtime = 'edge';

import Gallery from "@/app/assets/components/Gallery/Gallery";
import { Suspense, useRef } from "react";
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";

export default function Page({ params }: { params: { reddit: string } }) {
    return (
        <>
            <Suspense fallback={null}>
                <Gallery params={params} />
            </Suspense>
        </>
    );
}
