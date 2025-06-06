"use client"

import { MoonIcon } from "@heroicons/react/24/solid"
import { useAppSelector, useAppDispatch } from "@/app/assets/store/hooks"
import { RootState } from "@/app/assets/store/store";
import { setDarkTheme } from "@/app/assets/store/slices/themeSlice/themeSlice";
import { createCookie } from "@/app/assets/lib/utils/utils";
import { useEffect } from "react";

import styles from '@/public/styles/DarkTheme.module.css'

export default function DarkTheme() {
    const isDarkTheme = useAppSelector((state: RootState) => state.theme.isDarkTheme);
    const dispatch = useAppDispatch();

    return (
        <div
            className={`
                ${isDarkTheme
                    ? `z-50 fixed right-0 bottom-0  m-6 p-1 rounded-full transition-all hover:bg-dark-surface hover:cursor-pointer ${styles.darkBorder}`
                    : `z-50 fixed right-0 bottom-0  m-6 p-1 rounded-full transition-all hover:bg-light-surface hover:cursor-pointer ${styles.border}`}`}
            onClick={((e) => {
                isDarkTheme ? dispatch(setDarkTheme(false)) : dispatch(setDarkTheme(true));
                isDarkTheme ? createCookie("dark-theme", "false", 60 * 60 * 24 * 365, "/") : createCookie("dark-theme", "true", 60 * 60 * 24 * 365, "/")
                isDarkTheme ? document.body.className = "bg-light-background" : document.body.className = "bg-dark-background";

            })}
        >
            <div className={`
                    ${isDarkTheme
                    ? `p-3 bg-dark-surface rounded-full transition-all`
                    : `p-3 bg-light-surface rounded-full transition-all`}
            `}>
                <MoonIcon className={`size-5 transition-colors duration-700 ${isDarkTheme ? "text-white transition-colors duration-700" : "transition-colors duration-700"}`} />
            </div>
        </div>
    )
}