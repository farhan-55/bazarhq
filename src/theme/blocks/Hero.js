export default function Hero({ shop }) {
  if (!shop.hero_image_url) return null

  return (
    <div className="w-full aspect-[3/1] sm:aspect-[4/1] overflow-hidden">
      <img
        src={shop.hero_image_url}
        alt={shop.name}
        className="w-full h-full object-cover"
      />
    </div>
  )
}
