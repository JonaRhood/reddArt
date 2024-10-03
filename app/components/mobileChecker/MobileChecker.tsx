"use client"

import { useEffect } from "react";
import { setIsMobile, setIsNotDesktop } from "@/app/lib/features/mobileSlice/mobileSlice";
import { useAppDispatch } from "@/app/lib/hooks";

function isTablet() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isTabletUserAgent = /ipad|android(?!.*mobile)|tablet/i.test(userAgent);
    const isTabletScreen = window.innerWidth >= 600 && window.innerWidth <= 1280;
    return isTabletUserAgent || isTabletScreen;
}

function isNonDesktop() {
    return isTablet() || window.innerWidth < 1280; // Ajuste para detectar no desktops
}

export default function MobileChecker() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (window.innerWidth < 640) {
            dispatch(setIsMobile(true));
            console.log("IsMobile True");
        }
        if (isNonDesktop()) {
            dispatch(setIsNotDesktop(true));
            console.log("IsNotDesktop True");
        }
    }, [])

    return null;
};