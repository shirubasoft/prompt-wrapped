export function Atmosphere() {
  return (
    <div className="atmosphere" aria-hidden="true">
      <div className="atmosphere__orb atmosphere__orb--one" />
      <div className="atmosphere__orb atmosphere__orb--two" />
      <div className="atmosphere__ring atmosphere__ring--one" />
      <div className="atmosphere__ring atmosphere__ring--two" />
      <div className="atmosphere__grid" />
      <div className="atmosphere__scan" />
      <div className="atmosphere__pixels">
        {Array.from({ length: 18 }, (_, index) => <i key={index} />)}
      </div>
      <div className="atmosphere__grain" />
    </div>
  )
}
