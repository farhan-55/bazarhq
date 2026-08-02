export default function Hero({ shop, props }) {
  if (!shop.hero_image_url) return null

  const heading = props?.heading
  const subheading = props?.subheading

  return (
    <div className="w-full aspect-[3/1] sm:aspect-[4/1] overflow-hidden relative">
      <img
        src={shop.hero_image_url}
        alt={shop.name}
        className="w-full h-full object-cover"
      />
      {(heading || subheading) && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.45))" }}
        >
          {heading && (
            <h2 className="text-white text-2xl sm:text-4xl font-semibold tracking-tight drop-shadow-md">
              {heading}
            </h2>
          )}
          {subheading && (
            <p className="text-white/90 text-sm sm:text-base mt-2 drop-shadow-md">
              {subheading}
            </p>
          )}
        </div>
      )}
    </div>
  )
}