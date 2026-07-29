import Link from "next/link";

export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="Mộc Nhiên - Trang chủ">
      <svg className="brand__mark" aria-hidden="true" viewBox="0 0 32 32">
        <path d="M7 11h18l1.5 16h-21L7 11Z" />
        <path d="M11 12V9a5 5 0 0 1 10 0v3" />
      </svg>
      <span>Mộc Nhiên</span>
    </Link>
  );
}
