/** Five-star rating row, with half stars. Icons come from Font Awesome. */
export function Stars({
  rating,
  className,
}: {
  rating: number;
  className?: string;
}) {
  return (
    <>
      {[1, 2, 3, 4, 5].map((star) => {
        const icon =
          rating >= star ? "fas fa-star"
          : rating >= star - 0.5 ? "fas fa-star-half-alt"
          : "far fa-star";
        return <i key={star} className={`${icon} ${className ?? "star"}`} />;
      })}
    </>
  );
}
