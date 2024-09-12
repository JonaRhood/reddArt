import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css'
import { ChevronRightIcon } from "@heroicons/react/24/solid";

interface NavDivSkeletonProps {
    redditAmount: number;
}

export function NavDivSkeleton({ redditAmount }: NavDivSkeletonProps) {
    return (
        <>
        {Array(redditAmount).fill(0).map((_, i) => (
            <div key={i} className="relative flex-column items-center bg-light-surface p-2 h-24 border-b-2 overflow-hidden">
                <div className="flex items-center">
                    <Skeleton circle width={50} height={50} />
                    <Skeleton height={20} width={150} className="ml-3" />
                </div>
                <div className="flex flex-col justify-center ml-2">
                    <Skeleton width={35} height={15} className="" />
                </div>
                <ChevronRightIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 size-3" />
            </div>
            ))}
        </>
    )
}