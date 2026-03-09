import PublicHeader from '@/components/navigation/PublicHeader';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      <PublicHeader />
      <main>{children}</main>
    </div>
  );
}
