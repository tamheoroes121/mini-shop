"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { productImageOptions } from "@/data/product-images";
import { formatCurrency, normalizeText } from "@/lib/format";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { productFields, toProduct, toProductRow, type ProductRow } from "@/lib/supabase/product-record";
import { useStore } from "@/contexts/StoreContext";
import type { Product } from "@/types";

const categoryLabels = {
  gom: "Gốm thủ công",
  "may-dan": "Mây đan",
  go: "Đồ gỗ",
  "trang-tri": "Trang trí",
} as const;

function createSlug(name: string) {
  const base = normalizeText(name).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${base || "san-pham"}-${Date.now().toString().slice(-6)}`;
}

export default function AdminProductsPage() {
  const { refreshProducts } = useStore();
  const [items, setItems] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [image, setImage] = useState<string>(productImageOptions[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabaseBrowser.from("products").select(productFields).order("created_at", { ascending: true });
    if (error) setMessage({ type: "error", text: `Không tải được sản phẩm: ${error.message}` });
    else setItems(((data ?? []) as unknown as ProductRow[]).map(toProduct));
    setLoading(false);
  }, []);

  useEffect(() => { void loadProducts(); }, [loadProducts]);

  const editing = items.find((item) => item.id === editingId);
  const visible = useMemo(
    () => items.filter((item) => normalizeText(`${item.name} ${item.categoryLabel}`).includes(normalizeText(query))),
    [items, query],
  );

  const edit = (product: Product) => {
    setEditingId(product.id);
    setImage(product.image);
    setMessage(null);
  };

  const reset = () => {
    setEditingId(null);
    setImage(productImageOptions[0]);
    setMessage(null);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setMessage(null);

    const data = new FormData(event.currentTarget);
    const name = String(data.get("name")).trim();
    const category = String(data.get("category")) as Product["category"];
    const id = editingId || `product-${crypto.randomUUID()}`;
    const product: Product = {
      id,
      slug: editing?.slug || createSlug(name),
      name,
      category,
      categoryLabel: categoryLabels[category],
      price: Number(data.get("price")),
      compareAtPrice: editing?.compareAtPrice,
      stock: Number(data.get("stock")),
      image,
      images: editing?.image === image ? editing.images : [image],
      description: String(data.get("description") || "").trim(),
      featured: data.get("featured") === "on",
      isNew: data.get("isNew") === "on",
    };
    const payload = toProductRow(product);

    const request = editingId
      ? supabaseBrowser.from("products").update(payload).eq("id", editingId).select(productFields).single()
      : supabaseBrowser.from("products").insert(payload).select(productFields).single();
    const { data: savedRow, error } = await request;

    if (error || !savedRow) {
      setMessage({ type: "error", text: `Không lưu được sản phẩm: ${error?.message || "Lỗi không xác định"}` });
      setSaving(false);
      return;
    }

    const saved = toProduct(savedRow as unknown as ProductRow);
    setItems((current) => editingId ? current.map((item) => item.id === editingId ? saved : item) : [saved, ...current]);
    setEditingId(saved.id);
    setImage(saved.image);
    setMessage({ type: "success", text: editingId ? "Đã cập nhật sản phẩm trên Supabase." : "Đã thêm sản phẩm vào Supabase." });
    await refreshProducts();
    setSaving(false);
  };

  const remove = async (product: Product) => {
    const confirmed = window.confirm(`Xóa “${product.name}” khỏi cửa hàng? Thao tác này không thể hoàn tác.`);
    if (!confirmed) return;
    setDeletingId(product.id);
    setMessage(null);
    const { error } = await supabaseBrowser.from("products").delete().eq("id", product.id);

    if (error) {
      setMessage({ type: "error", text: `Không xóa được sản phẩm: ${error.message}` });
    } else {
      setItems((current) => current.filter((item) => item.id !== product.id));
      if (editingId === product.id) reset();
      setMessage({ type: "success", text: "Đã xóa sản phẩm khỏi Supabase." });
      await refreshProducts();
    }
    setDeletingId(null);
  };

  return (
    <div className="admin-content admin-content--wide">
      <div className="admin-heading">
        <div><p className="eyebrow">Danh mục cửa hàng</p><h1>Quản lý sản phẩm</h1></div>
        <button className="admin-primary-button" type="button" onClick={reset}>Thêm sản phẩm</button>
      </div>
      <label className="admin-search" style={{ marginTop: 18 }}><input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Tìm sản phẩm..." /></label>
      {message && <p className={`admin-form-message ${message.type}`} role={message.type === "error" ? "alert" : "status"}>{message.text}</p>}

      <div className="admin-management-layout">
        <section className="admin-products-panel">
          <div className="admin-section-heading"><div><h2>Sản phẩm</h2><p><strong>{visible.length}</strong> sản phẩm trên Supabase.</p></div></div>
          <div className="admin-table-wrap">
            <table className="admin-product-table">
              <thead><tr><th>#</th><th>Sản phẩm</th><th>Danh mục</th><th>Giá</th><th>Kho</th><th>Thao tác</th></tr></thead>
              <tbody>{visible.map((product, index) => (
                <tr key={product.id}>
                  <td>{index + 1}</td>
                  <td><div className="admin-product-cell"><img src={product.image} alt="" /><strong>{product.name}</strong></div></td>
                  <td><span className="admin-category-tag">{product.categoryLabel}</span></td>
                  <td><strong>{formatCurrency(product.price)}</strong></td><td>{product.stock}</td>
                  <td><div className="admin-row-actions"><button type="button" onClick={() => edit(product)}>Sửa</button><button className="danger" type="button" disabled={deletingId === product.id} onClick={() => void remove(product)}>{deletingId === product.id ? "Đang xóa" : "Xóa"}</button></div></td>
                </tr>
              ))}</tbody>
            </table>
            {loading && <div className="admin-empty-orders">Đang tải sản phẩm từ Supabase...</div>}
            {!loading && !visible.length && <div className="admin-empty-orders">Không có sản phẩm phù hợp.</div>}
          </div>
        </section>

        <section className="admin-product-form-panel">
          <div className="admin-section-heading"><div><h2>{editing ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h2><p>Lưu trực tiếp vào kho Supabase.</p></div></div>
          <form key={editingId || "new"} className="admin-product-form" onSubmit={submit}>
            <label><span>Tên sản phẩm</span><input name="name" defaultValue={editing?.name} maxLength={150} required /></label>
            <div className="admin-form-row">
              <label><span>Danh mục</span><select name="category" defaultValue={editing?.category || "gom"}><option value="gom">Gốm thủ công</option><option value="may-dan">Mây đan</option><option value="go">Đồ gỗ</option><option value="trang-tri">Trang trí</option></select></label>
              <label><span>Giá bán</span><input name="price" type="number" defaultValue={editing?.price} min={1000} required /></label>
            </div>
            <label><span>Số lượng kho</span><input name="stock" type="number" defaultValue={editing?.stock ?? 10} min={0} required /></label>
            <label><span>Ảnh có sẵn</span><select value={image} onChange={(event) => setImage(event.target.value)}>{productImageOptions.map((path) => <option value={path} key={path}>{path.split("/").at(-1)}</option>)}</select></label>
            <div className="admin-image-preview"><img src={image} alt="Ảnh xem trước" /><span>Ảnh trong assets</span></div>
            <div className="admin-check-row"><label><input name="featured" type="checkbox" defaultChecked={Boolean(editing?.featured)} /><span>Nổi bật</span></label><label><input name="isNew" type="checkbox" defaultChecked={Boolean(editing?.isNew)} /><span>Sản phẩm mới</span></label></div>
            <label><span>Mô tả</span><textarea name="description" defaultValue={editing?.description} rows={3} maxLength={1000} /></label>
            <div className="admin-form-actions"><button className="admin-primary-button" type="submit" disabled={saving}>{saving ? "Đang lưu..." : "Lưu sản phẩm"}</button><button className="admin-secondary-button" type="button" onClick={reset}>Làm mới</button></div>
          </form>
        </section>
      </div>
    </div>
  );
}
