export default function SectionHeading({ kicker, icon: Icon, title, accent, subtitle }) {
  return (
    <div className="text-center mb-14">
      {kicker && (
        <span className="section-kicker">
          {Icon ? <Icon size={16} className="text-indigo-400" /> : null}
          {kicker}
        </span>
      )}
      <h2 className="section-heading mb-4">
        {title}{' '}
        {accent ? <span className="text-gradient">{accent}</span> : null}
      </h2>
      <div className="w-20 h-1 mx-auto rounded bg-gradient-to-r from-indigo-500 to-cyan-400" />
      {subtitle ? (
        <p className="text-[var(--muted-text)] text-lg max-w-2xl mx-auto mt-5">{subtitle}</p>
      ) : null}
    </div>
  )
}
