"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

type MessageState = { text: string; type: "error" | "success" } | null;

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<MessageState>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setMessage(null);

    const result = await login(email, password);
    if (!result.ok) {
      setMessage({ text: result.message || "Không thể đăng nhập.", type: "error" });
      setSubmitting(false);
      return;
    }

    setMessage({ text: "Đăng nhập thành công.", type: "success" });
    router.push(result.user?.role === "admin" ? "/admin" : "/");
    router.refresh();
  };

  return (
    <>
      <form className="auth-form" onSubmit={submit}>
        <label className="form-field">
          <span>Email</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required />
        </label>
        <label className="form-field">
          <span>Mật khẩu</span>
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" minLength={6} required />
        </label>
        <p className={`form-message${message ? ` ${message.type}` : ""}`} role={message?.type === "error" ? "alert" : undefined}>{message?.text}</p>
        <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? "Đang đăng nhập..." : "Đăng nhập"}</button>
      </form>
      <p className="auth-switch">Chưa có tài khoản? <Link href="/register">Đăng ký ngay</Link></p>
    </>
  );
}

export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState<MessageState>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const password = String(data.get("password"));

    if (password !== String(data.get("confirm"))) {
      setMessage({ text: "Mật khẩu xác nhận chưa trùng khớp.", type: "error" });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    const result = await register(String(data.get("name")), String(data.get("email")), password);

    if (!result.ok) {
      setMessage({ text: result.message || "Không thể đăng ký.", type: "error" });
      setSubmitting(false);
      return;
    }

    if (result.needsEmailConfirmation) {
      setMessage({ text: result.message || "Hãy kiểm tra email để xác nhận tài khoản.", type: "success" });
      form.reset();
      setSubmitting(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <>
      <form className="auth-form" onSubmit={submit}>
        <label className="form-field"><span>Họ và tên</span><input name="name" autoComplete="name" minLength={2} maxLength={100} required /></label>
        <label className="form-field"><span>Email</span><input name="email" type="email" autoComplete="email" required /></label>
        <label className="form-field"><span>Mật khẩu</span><input name="password" type="password" autoComplete="new-password" minLength={6} required /></label>
        <label className="form-field"><span>Xác nhận mật khẩu</span><input name="confirm" type="password" autoComplete="new-password" minLength={6} required /></label>
        <p className={`form-message${message ? ` ${message.type}` : ""}`} role={message?.type === "error" ? "alert" : "status"}>{message?.text}</p>
        <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? "Đang tạo tài khoản..." : "Đăng ký"}</button>
      </form>
      <p className="auth-switch">Đã có tài khoản? <Link href="/login">Đăng nhập</Link></p>
    </>
  );
}
