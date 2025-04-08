'use client'

import { useAppSelector } from "@/app/assets/store/hooks"
import { RootState } from "@/app/assets/store/store"
import { login } from "../../../lib/utils/loginAuth";

export default function RedditLogin() {
    const isDarkTheme = useAppSelector((state: RootState) => state.theme.isDarkTheme);

    return (
        <div className="flex justify-center w-full h-[70vh]">
            <div className="flex-col self-center w-[80%]">
                <span className={`
                ${"flex text-center"}
                ${isDarkTheme ? "text-white" : ""}
                `}>
                    You must log in to your Reddit account to continue:
                </span>
                <br />
                <div className="flex justify-center">
                    <button 
                    className="flex justify-center self-center bg-[#d93900] text-white text-[1.2rem]
                    px-4 py-2 rounded-full hover:bg-[#ae2c00] transition-colors"
                    onClick={() => login()}>
                        Log in to Reddit
                    </button>
                </div>
            </div>
        </div>
    )
}