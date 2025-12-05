"use client"

export default function MeshBackground() {
    return (
        <>
            {/* Animated Gradient Background */}
            <div
                className="absolute inset-0 w-full h-full overflow-hidden"
                style={{
                    background: 'linear-gradient(-45deg, #000000, #0a1628, #164e63, #0891b2, #06b6d4)',
                    backgroundSize: '400% 400%',
                    animation: 'gradientShift 15s ease infinite'
                }}
            />

            {/* Secondary animated layer for depth */}
            <div
                className="absolute inset-0 w-full h-full overflow-hidden opacity-40"
                style={{
                    background: 'radial-gradient(circle at 20% 50%, #06b6d4 0%, transparent 50%), radial-gradient(circle at 80% 80%, #f97316 0%, transparent 50%), radial-gradient(circle at 40% 20%, #0891b2 0%, transparent 50%)',
                    backgroundSize: '200% 200%',
                    animation: 'gradientMove 20s ease infinite'
                }}
            />

            {/* Subtle noise texture overlay */}
            <div
                className="absolute inset-0 w-full h-full opacity-5"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                }}
            />

            {/* CSS Animations */}
            <style jsx>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes gradientMove {
          0%, 100% {
            background-position: 0% 0%;
          }
          25% {
            background-position: 100% 0%;
          }
          50% {
            background-position: 100% 100%;
          }
          75% {
            background-position: 0% 100%;
          }
        }
      `}</style>
        </>
    )
}
