export function Footer() {
  return (
    <footer className="flex w-full justify-center border-t border-gray-800 text-gray-400 bg-black">
      <div className="flex w-full max-w-6xl items-center justify-between p-4">
        <div>
          <span className="font-serif italic text-green-400">Richard Li</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex size-2 items-center justify-center">
            <div className="size-2 rounded-full bg-green-400 animate-pulse-custom"></div>
          </div>
          <span className="text-sm">Updated 10/22/2025</span>
        </div>
      </div>
    </footer>
  )
}
