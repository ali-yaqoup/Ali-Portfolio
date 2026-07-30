import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Scene3D from "./Scene3D";
import { MagneticButton, RippleButton } from "./MicroInteractions";
import { Download, Mail, Github, Linkedin, ChevronDown } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const heroRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    gsap.fromTo(
      ".hero-text",
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        delay: 0.5,
      },
    );

    gsap.fromTo(
      ".hero-badge",
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        delay: 0.3,
        ease: "back.out(1.7)",
      },
    );
  }, []);

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative min-h-screen flex items-center pt-20 section-gradient"
    >
      <div className="absolute inset-0 z-0">
        <Scene3D className="opacity-60" />
      </div>

      <div className="absolute inset-0 z-10" style={{pointerEvents: 'none'}} />

      <div className="relative z-20 max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-[var(--body-text)] text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-[var(--accent-cyan)] rounded-full animate-pulse" />
            Available for new opportunities
          </div>

          <h1 className="hero-text text-5xl lg:text-7xl font-bold leading-tight mb-4 text-white">
            Hi, I'm <span className="text-gradient">Ali Yaqoub</span>
          </h1>

          <h2 className="hero-text text-2xl lg:text-3xl text-[var(--body-text)] font-medium mb-6 flex flex-wrap items-center gap-3">
            <span>Software Engineering Student</span>
          </h2>

          <p className="hero-text text-[var(--body-text)] text-lg max-w-xl mb-8 leading-relaxed">
            My name is Ali Derar Ali Yaqoub, a fourth-year Software Engineering student. I'm passionate about technology and solving problems through logical thinking and creativity. I aim to become a programmer who combines technical skills with creativity to build digital solutions that are both useful and enjoyable to use.
          </p>

          <div className="hero-text flex flex-wrap gap-4 mb-10">
            <a
              href={`${import.meta.env.BASE_URL}Ali_Yaqoub_CV.pdf`}
              download="Ali_Yaqoub_CV.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              <RippleButton className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#38bdf8] to-[#22d3ee] rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[0_12px_24px_rgba(34,211,238,0.12)] hover:-translate-y-1">
                <Download size={18} />
                <span>Download CV</span>
              </RippleButton>
            </a>

            <a href="#contact">
              <MagneticButton className="flex items-center gap-2 px-8 py-4 glass rounded-xl font-semibold hover:border-[var(--accent-cyan)] transition-all duration-300">
                <Mail size={18} />
                <span>Contact Me</span>
              </MagneticButton>
            </a>
          </div>

          <div className="hero-text flex gap-4">
            {[
              { icon: Github, href: "https://github.com/ali-yaqoup" },
              {
                icon: Linkedin,
                href: "https://www.linkedin.com/in/ahmadikirshaid/",
              },
            ].map(({ icon: Icon, href }, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 flex items-center justify-center glass rounded-xl text-[var(--muted-text)] hover:text-white hover:border-[var(--accent-cyan)] hover:glow hover:-translate-y-1 transition-all duration-300"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex justify-center items-center">
            <div className="relative">
            <div className="absolute -inset-10 bg-[rgba(56,189,248,0.06)] blur-3xl rounded-full" />
            <div className="relative glass rounded-2xl p-8 glow">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span className="w-3 h-3 bg-green-500 rounded-full" />
                </div>
                <span className="text-[var(--muted-text)] text-sm font-mono">
                  Ali Yaqoub@dev
                </span>
              </div>
              <div className="font-mono text-sm space-y-2">
                <p>
                  <span className="text-[var(--accent-cyan)]">$</span>{" "}
                  <span className="text-white">AliYA</span>
                </p>
                <p className="text-[var(--body-text)]">
                  <span className="text-[var(--accent-cyan)]">name:</span> "Ali Yaqoub"
                </p>
                <p className="text-[var(--body-text)]">
                  <span className="text-[var(--accent-cyan)]">role:</span> "Full Stack & Data Engineer"
                </p>
                <p className="text-[var(--body-text)]">
                  <span className="text-[var(--accent-cyan)]">education:</span> "An-Najah University"
                </p>
                <p className="text-[var(--body-text)]">
                  <span className="text-[var(--accent-cyan)]">passion:</span> "Building & Testing"
                </p>
                <p>
                  <span className="text-[var(--accent-cyan)]">$</span>{" "}
                  <span className="animate-pulse text-[var(--accent-cyan)]">_</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
        <a
          href="#about"
          className="flex flex-col items-center gap-2 text-[var(--body-text)] hover:text-white transition-colors"
        >
          <span className="text-sm">Scroll Down</span>
          <ChevronDown size={20} className="animate-bounce" />
        </a>
      </div>
    </section>
  );
}
