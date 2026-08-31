import { Github, Linkedin, Mail } from "lucide-react";
import { PROFILE } from "../constants";

export default function Footer() {
  const year = new Date().getFullYear();
  const links = [
    { icon: Github, href: PROFILE.github, label: "GitHub" },
    { icon: Linkedin, href: PROFILE.linkedin, label: "LinkedIn" },
    { icon: Mail, href: `mailto:${PROFILE.email}`, label: "Email" },
  ];

  return (
    <footer className="py-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <a href="#home" className="text-xl font-bold text-gradient">
          {PROFILE.name}
        </a>
        <p className="text-[var(--body-text)] text-sm text-center">
          © {year} {PROFILE.name}. Built with React, Tailwind, and a lot of coffee.
        </p>
        <div className="flex gap-4">
          {links.map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noopener noreferrer"
              aria-label={label}
              className="text-[var(--muted-text)] hover:text-white transition-colors"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
