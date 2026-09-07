import GlobalIntroPopup from '@/components/global-intro-popup';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <GlobalIntroPopup />
    </>
  );
}
