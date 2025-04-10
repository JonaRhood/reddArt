import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css'
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { useAppSelector } from "../../store/hooks";
import { RootState } from "../../store/store";

interface NavDivSkeletonProps {
    redditAmount: number;
}

interface GalleryDivSkeletonProps {
    postAmount: number;
}

export function NavDivSkeleton({ redditAmount }: NavDivSkeletonProps) {
    const isDarkTheme = useAppSelector((state: RootState) => state.theme.isDarkTheme);

    return (
        <>
            {Array(redditAmount).fill(0).map((_, i) => (
                <div key={i} 
                className={`
                    relative flex-column items-center p-2 h-24 border-b-[1px] overflow-hidden
                    ${isDarkTheme ? "bg-dark-surface border-gray-900/60" : "bg-light-surface"}
                `}
                >
                    <div className="flex items-center">
                        <Skeleton circle width={50} height={50} baseColor={`${isDarkTheme ? "#252525" : "#ebebeb" }`} highlightColor={`${isDarkTheme ? "#2f2f2f" : "#f5f5f5"}`}/>
                        <Skeleton height={20} width={150} className="ml-3" baseColor={`${isDarkTheme ? "#252525" : "#ebebeb" }`} highlightColor={`${isDarkTheme ? "#2f2f2f" : "#f5f5f5"}`} />
                    </div>
                    <div className="flex flex-col justify-center ml-2">
                        <Skeleton width={35} height={15} className="" baseColor={`${isDarkTheme ? "#252525" : "#ebebeb" }`} highlightColor={`${isDarkTheme ? "#2f2f2f" : "#f5f5f5"}`} />
                    </div>
                    <ChevronRightIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 size-3" />
                </div>
            ))}
        </>
    )
}


export function GalleryDivSkeleton({ postAmount }: GalleryDivSkeletonProps) {
    return (
        <>
            {Array(postAmount).fill(0).map((_, i) => (
                <div key={i} className="relative flex-column items-center bg-light-surface p-2 h-24 border-b-2 overflow-hidden">
                    <div className="flex items-center">
                        <Skeleton circle width={50} height={50} />
                        <Skeleton height={20} width={150} className="ml-3" />
                    </div>
                </div>
            ))}
        </>
    )
}