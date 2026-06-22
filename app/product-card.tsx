import type { Product } from "@/config/products";

function formatPrice(product: Product): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: product.currency,
    maximumFractionDigits: 0,
  }).format(product.price);
}

export function ProductCard({
  product,
  ctaLabel = "View product",
}: {
  product: Product;
  ctaLabel?: string;
}) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-slate-200 bg-white/88 p-4 shadow-xl shadow-blue-950/8 backdrop-blur">
      {product.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={product.title}
          className="aspect-video w-full rounded-md border border-slate-100 object-cover"
          loading="lazy"
          src={product.imageUrl}
        />
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-md border border-blue-100 bg-blue-50 text-sm font-bold text-blue-700">
          Product
        </div>
      )}
      <div className="flex flex-1 flex-col">
        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
              {product.brand}
            </p>
            <h3 className="mt-1 text-xl font-bold leading-7 text-slate-950">
              {product.title}
            </h3>
          </div>
          <span className="shrink-0 rounded-md bg-slate-50 px-2.5 py-1 text-sm font-bold text-slate-700">
            {formatPrice(product)}
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {product.shortDescription}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {product.tags.slice(0, 3).map((tag) => (
            <span
              className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700"
              key={tag}
            >
              {tag}
            </span>
          ))}
        </div>
        <a
          className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
          href={product.destinationUrl}
          rel="sponsored noreferrer"
          target="_blank"
        >
          {ctaLabel}
        </a>
      </div>
    </article>
  );
}
