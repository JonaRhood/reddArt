"use client";

export const runtime = 'edge';

import ZoomInGallery from "@/app/components/ZoomInGallery/ZoomInGallery";
import { Suspense } from "react";

export default function Page({ params }: { params: { reddit: string, image: string } }) {
    return (
        <>
            <Suspense fallback={null}>
                <ZoomInGallery params={params} />
            </Suspense>
        </>
    );
}
