import { GraduationCap, Calendar } from 'lucide-react'
import AnimatedSection from '../components/AnimatedSection'
import SectionHeading from '../components/SectionHeading'
import educationData from '../education.json'

export default function EducationSection() {
  return (
    <section id="education" className="py-24 relative section-gradient">
      <div className="max-w-5xl mx-auto px-6">
        <AnimatedSection>
          <SectionHeading
            kicker="Education"
            icon={GraduationCap}
            title="Academic"
            accent="Background"
          />
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-5">
          {educationData.map((edu) => (
            <div key={edu.institution} className="glass rounded-2xl p-6 hover:border-indigo-400/40 transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/15 flex items-center justify-center shrink-0">
                  <GraduationCap size={20} className="text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{edu.degree}</h3>
                  <p className="text-slate-400 text-sm">{edu.institution}</p>
                </div>
              </div>
              {edu.description ? (
                <p className="text-slate-300 text-sm mb-4 leading-relaxed">{edu.description}</p>
              ) : null}
              <div className="flex items-center gap-2 text-indigo-300 text-sm">
                <Calendar size={14} />
                <span>{edu.period}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
