"use client";

export const runtime = 'edge';

import UserGallery from "@/app/assets/components/UserGallery/UserGallery";
import { Suspense, useRef } from "react";
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";

export default function Page({ params }: { params: { user: string } }) {
    return (
        <>
            <Suspense fallback={null}>
                <UserGallery params={params} />
            </Suspense>
        </>
    );
}
