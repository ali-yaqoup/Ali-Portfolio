import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Scene3D from "./Scene3D";
import { Download, Mail, Github, Linkedin, ChevronDown } from "lucide-react";
import { CV_HREF, PROFILE } from "../constants";

export default function Hero() {
  const heroRef = useRef(null);
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setRoleIndex((current) => (current + 1) % PROFILE.roles.length);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    gsap.fromTo(
      ".hero-text",
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.14,
        ease: "power3.out",
        delay: 0.2,
      },
    );

    gsap.fromTo(
      ".hero-badge",
      { opacity: 0, scale: 0.86 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.7,
        delay: 0.1,
        ease: "back.out(1.7)",
      },
    );
  }, []);

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative min-h-screen flex items-center pt-20 overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <Scene3D className="opacity-60" />
      </div>
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#070712]/20 via-[#070712]/35 to-[#070712] pointer-events-none" />

      <div className="relative z-20 max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-[var(--body-text)] text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Available for internships and full-time roles
          </div>

          <h1 className="hero-text text-5xl lg:text-7xl font-bold leading-tight mb-4 text-white">
            Hi, I'm <span className="text-gradient">{PROFILE.name}</span>
          </h1>

          <h2 className="hero-text text-2xl lg:text-3xl text-slate-200 font-medium mb-6 min-h-[2.5rem]">
            {PROFILE.roles[roleIndex]}
          </h2>

          <p className="hero-text text-[var(--body-text)] text-lg max-w-xl mb-8 leading-relaxed">
            {PROFILE.headline}
          </p>

          <div className="hero-text flex flex-wrap gap-4 mb-10">
            <a
              href={CV_HREF}
              download="Ali_Yaqoub_CV.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-xl font-semibold text-slate-950 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/20 hover:-translate-y-1"
            >
              <Download size={18} />
              Download CV
            </a>

            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-8 py-4 glass rounded-xl font-semibold hover:border-cyan-400/60 transition-all duration-300 hover:-translate-y-1"
            >
              <Mail size={18} />
              Contact Me
            </a>
          </div>

          <div className="hero-text flex gap-4">
            {[
              { icon: Github, href: PROFILE.github, label: "GitHub" },
              { icon: Linkedin, href: PROFILE.linkedin, label: "LinkedIn" },
              { icon: Mail, href: `mailto:${PROFILE.email}`, label: "Email" },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                aria-label={label}
                className="w-12 h-12 flex items-center justify-center glass rounded-xl text-[var(--muted-text)] hover:text-white hover:border-cyan-400/50 hover:glow hover:-translate-y-1 transition-all duration-300"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex justify-center items-center">
          <div className="relative w-full max-w-md">
            <div className="absolute -inset-10 bg-[rgba(99,102,241,0.12)] blur-3xl rounded-full" />
            <div className="relative glass rounded-2xl p-8 glow">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span className="w-3 h-3 bg-green-500 rounded-full" />
                </div>
                <span className="text-[var(--muted-text)] text-sm font-mono">
                  ali@portfolio
                </span>
              </div>
              <div className="font-mono text-sm space-y-2">
                <p>
                  <span className="text-cyan-400">$</span>{" "}
                  <span className="text-white">whoami</span>
                </p>
                <p className="text-[var(--body-text)]">
                  <span className="text-indigo-400">name:</span> "{PROFILE.name}"
                </p>
                <p className="text-[var(--body-text)]">
                  <span className="text-indigo-400">role:</span> "Full Stack Developer"
                </p>
                <p className="text-[var(--body-text)]">
                  <span className="text-indigo-400">education:</span> "{PROFILE.university}"
                </p>
                <p className="text-[var(--body-text)]">
                  <span className="text-indigo-400">focus:</span> "React · Laravel · Product"
                </p>
                <p>
                  <span className="text-cyan-400">$</span>{" "}
                  <span className="animate-pulse text-cyan-400">_</span>
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
