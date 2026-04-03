import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import StickySnsBanner from "@/components/layout/sticky-sns-banner";
import Hero from "@/components/lp/hero";
import Philosophy from "@/components/lp/philosophy";
import Profile from "@/components/lp/profile";
// import Treatments from "@/components/lp/treatments";
import BlogPreview from "@/components/lp/blog-preview";
import FaqSection from "@/components/lp/faq-section";
import Invitation from "@/components/lp/invitation";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Philosophy />
        <Profile />
        {/* <Treatments /> 開業前のため一時非表示 */}
        <BlogPreview />
        <FaqSection />
        <Invitation />
      </main>
      <StickySnsBanner />
      <Footer />
    </>
  );
}


