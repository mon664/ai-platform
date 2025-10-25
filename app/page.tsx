export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          AI Content Platform
        </h1>
        <p className="text-xl text-center mb-4">
          Cloudflare Pages로 자동 배포 완료!
        </p>
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Git Push만 하면 자동으로 배포됩니다.
          </p>
        </div>
      </div>
    </main>
  )
}
