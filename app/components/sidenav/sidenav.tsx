import ArtReddits from "./artReddits";
import CustomIcon from '@/app/lib/resources/CustomIcon'


export default function Sidenav() {
    return (
        <div className="flex flex-col w-80 z-50 bg-light-surface h-screen overflow-hidden fixed">
            <div className="flex w-80 items-center justify-center border-b-2 bg-light-surface p-2 h-24 fixed top-0 left-0 right-0 z-10">
                <CustomIcon className="w-12 h-12 text-[#ff4500]" />
                <h1 className="text-center font-bold text-3xl">
                    <span className="text-[#ff4500]">redd</span>
                    <span className="text-gradient">Art</span>
                </h1>
            </div>
            <div className="pt-24 overflow-hidden overflow-scroll overflow-x-hidden">
                <ArtReddits />
            </div>
        </div>
    );
}
