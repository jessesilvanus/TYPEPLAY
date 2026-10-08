/**
 * TYPEPLAY — PageContainer
 * ==========================================================================
 * Structural layout wrapper that gives every page a consistent header,
 * scrollable content region, and footer. It enforces the overall shell
 * (sticky header, flex column that pushes the footer down) and renders the
 * <main> landmark that holds each route's content.
 *
 * Keeping this here means individual pages never repeat layout markup —
 * they just supply their <children>.
 */
import type { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface PageContainerProps {
  /** Page content rendered inside <main>. */
  children: ReactNode;
}

export default function PageContainer({ children }: PageContainerProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      <Header />
      <main
        id="main-content"
        tabIndex={-1}
        style={{ flex: 1, outline: 'none' }}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
