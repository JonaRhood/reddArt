import ArtReddits from "./artReddits"

export default function Sidenav() {
    return (
        <div className="flex-row w-80 bg-gray-100 h-screen">
            <div className="flex w-full bg-gray-200 p-2 h-24 border-gray-300 border-2">
                <span>Reddit Client Logo</span>
            </div>
            <div>
                <ArtReddits />
            </div>
        </div>
    )
}