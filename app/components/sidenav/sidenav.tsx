import ArtReddits from "./artReddits"

export default function Sidenav() {
    return (
        <div className="flex-row w-80 bg-light-surface h-screen overflow-hidden overflow-scroll overflow-x-hidden">
            <div className="flex w-80 bg-gray-100 p-2 h-24 border-light-border border-2 fixed z-10">
                <span>Reddit Client Logo</span>
            </div>
            <div className="">
                <ArtReddits />
            </div>
        </div>
    )
}