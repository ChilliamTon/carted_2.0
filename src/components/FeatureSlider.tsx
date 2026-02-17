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
    title: 'Curate products from everywhere',
    description: 'Save finds from any store into focused collections without losing context.',
  },
  {
    icon: FaLightbulb,
    title: 'Compare smarter, buy better',
    description: 'Review pricing and availability trends before you commit to a purchase.',
  },
  {
    icon: FaShareAlt,
    title: 'Share lists with your circle',
    description: 'Coordinate gift planning and recommendations with friends and family.',
  },
  {
    icon: FaBell,
    title: 'Catch every meaningful drop',
    description: 'Get notified when an item changes in price or comes back in stock.',
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
      <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      </div>

      <div className="transition-all duration-700 ease-in-out transform" key={currentIndex}>
        <CurrentIcon className="w-11 h-11 mb-4 text-primary-200" />
        <h1 className="text-3xl lg:text-4xl font-bold font-display leading-[1.15] mb-4 tracking-tight">
          {features[currentIndex].title}
        </h1>
        <p className="text-base text-amber-100/80 max-w-sm leading-relaxed">
          {features[currentIndex].description}
        </p>
      </div>

      <div className="flex gap-2 mb-8">
        {features.map((_, index) => (
          <span
            key={index}
            className={`block w-2 h-2 rounded-full transition-all duration-300 ${
              currentIndex === index ? 'bg-primary-100 w-6' : 'bg-white/40'
            }`}
          />
        ))}
      </div>

      <div className="flex text-sm font-medium text-slate-500">
        <span>© 2026 Wishlist Central</span>
      </div>
    </div>
  )
}
