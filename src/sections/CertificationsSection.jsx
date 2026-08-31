import { Award, BadgeCheck, ExternalLink, FileText } from 'lucide-react'
import AnimatedSection, { StaggerChildren } from '../components/AnimatedSection'
import SectionHeading from '../components/SectionHeading'
import certificationsData from '../certifications.json'

const assetUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}

export default function CertificationsSection() {
  return (
    <section id="certifications" className="py-24 relative section-gradient">
      <div className="max-w-6xl mx-auto px-6">
        <AnimatedSection>
          <SectionHeading
            kicker="Achievements"
            icon={Award}
            title="Certifications"
            subtitle="Courses and badges I completed — open any card to view the certificate."
          />
        </AnimatedSection>

        <StaggerChildren className="grid md:grid-cols-2 gap-6" stagger={0.1}>
          {certificationsData.map((cert) => {
            const fileUrl = cert.file ? assetUrl(cert.file) : ''

            return (
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

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors">{cert.name}</h3>
                    <p className="text-slate-300 text-sm">{cert.organization}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-indigo-300 text-sm font-medium">{cert.year}</span>
                      {cert.distinction ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300">Distinction</span>
                      ) : null}
                    </div>
                    {(fileUrl || cert.href) && (
                      <div className="flex flex-wrap gap-3 mt-3">
                        {fileUrl && (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white"
                          >
                            <FileText size={14} />
                            View certificate
                          </a>
                        )}
                        {cert.href && (
                          <a
                            href={cert.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-indigo-300 hover:text-indigo-200"
                          >
                            <ExternalLink size={14} />
                            Verify
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </StaggerChildren>
      </div>
    </section>
  )
}
