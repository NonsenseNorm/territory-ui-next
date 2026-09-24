import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
export function Button({ secondary, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { secondary?: boolean }) {
  return <button {...props} className={`button ${secondary ? 'secondary' : ''} ${className}`} />;
}
export function Frame({ title, back, children, className = '' }: { title?: string; back?: string; children: ReactNode; className?: string }) {
  return <div className={`phone ${className}`}>
    {title && <header className="screen-header">{back && <Link href={back} className="back" aria-label="戻る"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5m0 0 7-7m-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></Link>}<span>{title}</span></header>}
    {children}
  </div>;
}

