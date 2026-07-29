"use client";

import { useMemo, useState } from "react";
import { categories } from "@/data/categories";
import { normalizeText } from "@/lib/format";
import type { CategoryId, Product } from "@/types";
import { ProductCard } from "./ProductCard";

type PriceRange = "all" | "under300" | "300to600" | "over600";
type SortMode = "featured" | "price-asc" | "price-desc" | "name";

export function ProductCatalog({ initialQuery = "", products }: { initialQuery?: string; products: Product[] }) {
  const [category, setCategory] = useState<"all" | CategoryId>("all");
  const [priceRange, setPriceRange] = useState<PriceRange>("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<SortMode>("featured");
  const [filterOpen, setFilterOpen] = useState(false);

  const visibleProducts = useMemo(() => {
    const result = products.filter((product) => {
      const priceMatch = priceRange === "all" || (priceRange === "under300" && product.price < 300000) || (priceRange === "300to600" && product.price >= 300000 && product.price <= 600000) || (priceRange === "over600" && product.price > 600000);
      return (category === "all" || product.category === category) && priceMatch && (!inStockOnly || product.stock > 0) && normalizeText(product.name).includes(normalizeText(query.trim()));
    });
    return result.sort((a, b) => sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : sort === "name" ? a.name.localeCompare(b.name, "vi") : Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }, [category, priceRange, inStockOnly, query, sort]);

  return (
    <div className="product-layout">
      <aside className={`filter-panel${filterOpen ? " open" : ""}`} aria-label="Bộ lọc sản phẩm">
        <div className="filter-heading"><h2>Bộ lọc</h2><button className="filter-close" type="button" onClick={() => setFilterOpen(false)} aria-label="Đóng bộ lọc">×</button></div>
        <fieldset className="filter-group"><legend>Danh mục</legend>{categories.map((item) => <label key={item.id}><input type="radio" name="category" checked={category === item.id} onChange={() => setCategory(item.id)} /><span>{item.label}</span><small>{item.id === "all" ? products.length : products.filter((product) => product.category === item.id).length}</small></label>)}</fieldset>
        <fieldset className="filter-group"><legend>Khoảng giá</legend>{([['all','Tất cả mức giá'],['under300','Dưới 300.000đ'],['300to600','300.000đ – 600.000đ'],['over600','Trên 600.000đ']] as Array<[PriceRange,string]>).map(([value,label]) => <label key={value}><input type="radio" name="price" checked={priceRange === value} onChange={() => setPriceRange(value)} /><span>{label}</span></label>)}</fieldset>
        <fieldset className="filter-group filter-group--last"><legend>Tình trạng</legend><label><input type="checkbox" checked={inStockOnly} onChange={(event) => setInStockOnly(event.target.checked)} /><span>Còn hàng</span></label></fieldset>
      </aside>
      <section className="product-results" aria-labelledby="products-title">
        <div className="results-heading"><div><p className="eyebrow">Bộ sưu tập Mộc Nhiên</p><h1 id="products-title">Tất cả sản phẩm</h1><p className="results-count">Đang hiển thị <strong>{visibleProducts.length}</strong> sản phẩm</p></div><button className="filter-open" type="button" onClick={() => setFilterOpen(true)}>Bộ lọc</button></div>
        <div className="catalog-tools"><label className="catalog-search"><input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Tìm trong sản phẩm..." aria-label="Tìm trong sản phẩm" /></label><label className="sort-select"><select value={sort} onChange={(event) => setSort(event.target.value as SortMode)} aria-label="Sắp xếp"><option value="featured">Nổi bật</option><option value="price-asc">Giá thấp đến cao</option><option value="price-desc">Giá cao đến thấp</option><option value="name">Tên A–Z</option></select></label></div>
        {visibleProducts.length > 0 ? <div className="listing-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} variant="listing" />)}</div> : <p className="empty-results">Không tìm thấy sản phẩm phù hợp với bộ lọc.</p>}
      </section>
    </div>
  );
}
