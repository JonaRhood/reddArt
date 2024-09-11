import ArtReddits from "./artReddits"

export default function Sidenav() {
    return (
        <div className="flex-row w-80 bg-gray-100 h-screen overflow-hidden overflow-scroll overflow-x-hidden">
            <div className="flex w-80 bg-gray-200 p-2 h-24 border-gray-300 border-2 fixed z-10">
                <span>Reddit Client Logo</span>
            </div>
            <div className="">
                <ArtReddits />
            </div>
        </div>
    )
}