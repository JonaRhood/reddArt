"use client";
import ZoomInGallery from "@/app/components/ZoomInGallery/ZoomInGallery";
import { Suspense } from "react";

export default function Page({ params }: { params: { reddit: string } }) {
    return (
        <>
            <Suspense>
                <ZoomInGallery params={params} />
            </Suspense>
        </>
    );
}
