'use client'

// TODO Logic for errors in Reddit login

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/app/assets/store/hooks";
import { setAuthorized } from "@/app/assets/store/slices/generalSlice/generalSlice";
import { RootState } from "@/app/assets/store/store";

export default function AuthHandlerTrial() {

    const isAuthorized = useAppSelector((state: RootState) => state.general.isAuthorized);
    const isRefreshToken = useAppSelector((state: RootState) => state.general.isRefreshToken);
    const dispatch = useAppDispatch();

    const searchParams = useSearchParams();
    const router = useRouter();

    const urlState = searchParams.get("state");
    const urlCode = searchParams.get("code");
    const urlError = searchParams.get("error");

    
    useEffect(() => {
        const redirectUri = process.env.NEXT_PUBLIC_REDDIT_REDIRECT_URL;
        const localState = localStorage.getItem("STATE")
    
        if (urlCode && urlState == localState && !isAuthorized) {
            const fetchToken = async () => {
                try {
                    const response = await fetch('/assets/routes/reddit-token', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ urlCode, redirectUri }),
                    });
                    
                    if (response.ok) {
                        dispatch(setAuthorized(true));
                        localStorage.removeItem("STATE")
                        router.replace("/");
                    }

                } catch (err: any) {
                    throw new Error("Token Fetch Failed: ", err);
                }
            }
            
            fetchToken();
        }        
    }, [])

    return null;
}