"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function LoginForm() {
  const { login, logout } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [message, setMessage] = useState("");
  useEffect(() => { if (new URLSearchParams(window.location.search).get("logout") === "1") { logout(); window.history.replaceState({}, "", "/login"); } }, [logout]);
  const submit = (event: FormEvent) => { event.preventDefault(); const result = login(email, password); if (!result.ok) return setMessage(result.message || "Không thể đăng nhập."); setMessage("Đăng nhập thành công..."); router.push(result.user?.role === "admin" ? "/admin" : "/"); };
  return <><form className="auth-form" onSubmit={submit}><label className="form-field"><span>Email</span><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required /></label><label className="form-field"><span>Mật khẩu</span><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={6} required /></label><p className={`form-message${message ? " error" : ""}`}>{message}</p><button className="auth-submit" type="submit">Đăng nhập</button></form><p className="auth-switch">Chưa có tài khoản? <Link href="/register">Đăng ký ngay</Link></p><div className="demo-accounts"><div className="demo-accounts__heading"><span /><p>Tài khoản dùng thử</p><span /></div><button type="button" onClick={() => { setEmail("khach@mocnhien.vn"); setPassword("123456"); }}><strong>Khách hàng</strong><small>khach@mocnhien.vn / 123456</small></button><button type="button" onClick={() => { setEmail("admin@mocnhien.vn"); setPassword("admin123"); }}><strong>Quản trị viên</strong><small>admin@mocnhien.vn / admin123</small></button></div></>;
}

export function RegisterForm() {
  const { register } = useAuth(); const router = useRouter();
  const [message, setMessage] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = new FormData(event.currentTarget); const password = String(data.get("password")); if (password !== String(data.get("confirm"))) return setMessage("Mật khẩu xác nhận chưa trùng khớp."); const result = register(String(data.get("name")), String(data.get("email")), password); if (!result.ok) return setMessage(result.message || "Không thể đăng ký."); router.push("/"); };
  return <><form className="auth-form" onSubmit={submit}><label className="form-field"><span>Họ và tên</span><input name="name" minLength={2} required /></label><label className="form-field"><span>Email</span><input name="email" type="email" required /></label><label className="form-field"><span>Mật khẩu</span><input name="password" type="password" minLength={6} required /></label><label className="form-field"><span>Xác nhận mật khẩu</span><input name="confirm" type="password" minLength={6} required /></label><p className={`form-message${message ? " error" : ""}`}>{message}</p><button className="auth-submit" type="submit">Đăng ký</button></form><p className="auth-switch">Đã có tài khoản? <Link href="/login">Đăng nhập</Link></p></>;
}
