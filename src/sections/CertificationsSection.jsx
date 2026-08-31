import { Award, BadgeCheck } from 'lucide-react'
import AnimatedSection, { StaggerChildren } from '../components/AnimatedSection'
import SectionHeading from '../components/SectionHeading'
import certificationsData from '../certifications.json'

export default function CertificationsSection() {
  return (
    <section id="certifications" className="py-24 relative section-gradient">
      <div className="max-w-6xl mx-auto px-6">
        <AnimatedSection>
          <SectionHeading
            kicker="Achievements"
            icon={Award}
            title="Certifications"
          />
        </AnimatedSection>

        <StaggerChildren className="grid md:grid-cols-2 gap-6" stagger={0.1}>
          {certificationsData.map((cert) => (
            <div
              key={`${cert.name}-${cert.year}`}
              className="glass rounded-2xl p-6 hover:border-indigo-400/40 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                    <Award size={26} className="text-indigo-300" />
                  </div>
                  {cert.verified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                      <BadgeCheck size={14} className="text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold group-hover:text-indigo-300 transition-colors">{cert.name}</h3>
                  <p className="text-slate-400 text-sm">{cert.organization}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-indigo-300 text-sm font-medium">{cert.year}</span>
                    {cert.distinction ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300">Distinction</span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </StaggerChildren>
      </div>
    </section>
  )
}
