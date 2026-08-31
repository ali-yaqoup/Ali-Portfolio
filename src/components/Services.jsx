import AnimatedSection, { StaggerChildren } from './AnimatedSection'
import { TiltCard } from './MicroInteractions'
import SectionHeading from './SectionHeading'
import servicesData from '../services.json'
import { Code2, TestTube2, Cpu, Database, Sparkles } from 'lucide-react'

const iconMap = { Code2, TestTube2, Cpu, Database }

export default function Services() {
  return (
    <section id="services" className="py-24 section-gradient">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection>
          <SectionHeading
            kicker="What I Do"
            icon={Sparkles}
            title="My"
            accent="Services"
            subtitle="From product UI to APIs, testing, and data modeling."
          />
        </AnimatedSection>

        <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {servicesData.map((service) => {
            const Icon = iconMap[service.icon]
            return (
              <TiltCard key={service.title} className="group glass rounded-2xl p-8 text-center hover:glow transition-all duration-500">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br from-indigo-500/20 to-cyan-400/15">
                  {Icon ? <Icon size={28} className="text-indigo-200" /> : null}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{service.title}</h3>
                <p className="text-[var(--body-text)]">{service.description}</p>
              </TiltCard>
            )
          })}
        </StaggerChildren>
      </div>
    </section>
  )
}
