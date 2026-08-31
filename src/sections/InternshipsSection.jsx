import { Briefcase, CheckCircle2 } from 'lucide-react'
import AnimatedSection from '../components/AnimatedSection'
import SectionHeading from '../components/SectionHeading'
import internshipsData from '../internships.json'

export default function InternshipsSection() {
  return (
    <section id="internships" className="py-24 relative section-gradient">
      <div className="max-w-5xl mx-auto px-6">
        <AnimatedSection>
          <SectionHeading
            kicker="Experience"
            icon={Briefcase}
            title="Internships"
            subtitle="Hands-on product work across frontend, backend, and APIs."
          />
        </AnimatedSection>

        <div className="relative max-w-3xl mx-auto">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 to-cyan-400" />

          <div className="space-y-8">
            {internshipsData.map((internship) => (
              <div key={`${internship.company}-${internship.date}`} className="relative flex gap-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-slate-950 text-sm flex-shrink-0 z-10">
                  {internship.logo}
                </div>

                <div className="glass rounded-xl p-6 flex-1 hover:border-indigo-400/40 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-white">{internship.role}</h3>
                    <span className="text-slate-400 text-sm">{internship.date}</span>
                  </div>
                  <p className="text-indigo-300 text-sm mb-4">{internship.company}</p>
                  <ul className="space-y-2">
                    {internship.achievements.map((item) => (
                      <li key={item} className="flex gap-2 text-slate-300 text-sm leading-relaxed">
                        <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
