"use client";

import UserGallery from "@/app/components/UserGallery/UserGallery";
import { Suspense, useRef } from "react";
import { Modal } from "./modal";

export default function Page({ params }: { params: { user: string } }) {
    return (
        <>
            <Suspense fallback={null}>
                    <Modal><UserGallery params={params} /></Modal>
            </Suspense>
        </>
    );
}
