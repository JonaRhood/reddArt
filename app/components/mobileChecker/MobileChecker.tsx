"use client"

import { useEffect } from "react";
import { setIsMobile } from "@/app/lib/features/mobileSlice/mobileSlice";
import { useAppDispatch } from "@/app/lib/hooks";

export default function MobileChecker() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (window.innerWidth < 640) {
            dispatch(setIsMobile(true));
            console.log("IsMobile True");
        }
    }, [])

    return null;
};