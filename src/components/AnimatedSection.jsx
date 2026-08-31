import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function AnimatedSection({ 
  children, 
  className = "", 
  animation = "fadeUp",
  delay = 0,
  duration = 1,
  stagger = 0.1
}) {
  const sectionRef = useRef(null)
  
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    
    const animations = {
      fadeUp: {
        from: { opacity: 0, y: 60 },
        to: { opacity: 1, y: 0 }
      },
      fadeDown: {
        from: { opacity: 0, y: -60 },
        to: { opacity: 1, y: 0 }
      },
      fadeLeft: {
        from: { opacity: 0, x: -60 },
        to: { opacity: 1, x: 0 }
      },
      fadeRight: {
        from: { opacity: 0, x: 60 },
        to: { opacity: 1, x: 0 }
      },
      scale: {
        from: { opacity: 0, scale: 0.8 },
        to: { opacity: 1, scale: 1 }
      },
      rotate: {
        from: { opacity: 0, rotation: -10 },
        to: { opacity: 1, rotation: 0 }
      }
    }
    
    const anim = animations[animation] || animations.fadeUp
    
    const tween = gsap.fromTo(el, anim.from, {
      ...anim.to,
      duration,
      delay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none reverse"
      }
    })
    
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [animation, delay, duration])
  
  return (
    <div ref={sectionRef} className={className}>
      {children}
    </div>
  )
}

export function StaggerChildren({ children, className = "", stagger = 0.1 }) {
  const containerRef = useRef(null)
  
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    
    const items = el.children
    
    const tween = gsap.fromTo(items, 
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      }
    )
    
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [stagger])
  
  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}
