import { useState, useEffect } from 'react'
import { IconType } from 'react-icons'
import { FaBoxes, FaLightbulb, FaShareAlt, FaBell } from 'react-icons/fa'

interface Feature {
  icon: IconType
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: FaBoxes,
    title: 'Organize Your Desires',
    description: 'Create and manage multiple collections for every occasion and need.',
  },
  {
    icon: FaLightbulb,
    title: 'Discover New Ideas',
    description: 'Explore trending items and get inspired for your next gift or purchase.',
  },
  {
    icon: FaShareAlt,
    title: 'Share with Friends & Family',
    description: 'Easily share your collections with loved ones for hassle-free gifting.',
  },
  {
    icon: FaBell,
    title: 'Price Drop Alerts',
    description: 'Get notified when items in your collections go on sale.',
  },
]

export function FeatureSlider({ className }: { className?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % features.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const CurrentIcon = features[currentIndex].icon

  return (
    <div className={`relative w-full h-full flex flex-col justify-between text-white ${className}`}>
      {/* Existing logo and title */}
      <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      </div>

      {/* Feature Content */}
      <div className="transition-all duration-700 ease-in-out transform" key={currentIndex}>
        <CurrentIcon className="w-12 h-12 mb-4 text-primary-300" />
        <h1 className="text-3xl lg:text-4xl font-bold font-display leading-[1.2] mb-4 tracking-tight">
          {features[currentIndex].title}
        </h1>
        <p className="text-base text-slate-400 max-w-sm leading-relaxed">
          {features[currentIndex].description}
        </p>
      </div>

      {/* Pagination dots */}
      <div className="flex gap-2 mb-8">
        {features.map((_, index) => (
          <span
            key={index}
            className={`block w-2 h-2 rounded-full transition-all duration-300 ${
              currentIndex === index ? 'bg-white w-5' : 'bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* Existing footer */}
      <div className="flex text-sm font-medium text-slate-500">
        <span>© 2026 Wishlist Central</span>
      </div>
    </div>
  )
}
