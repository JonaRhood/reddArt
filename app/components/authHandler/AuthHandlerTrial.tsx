'use client'

import { useSearchParams } from "next/navigation";

export default function AuthHandlerTrial() {

    const searchParams = useSearchParams();

    const urlState = searchParams.get("state");
    const urlCode = searchParams.get("code");
    const urlError = searchParams.get("error");

    console.log(urlState);
    console.log(urlCode);
    console.log(urlError);

    return null;
}