'use client'
import BestSelling from "@/components/BestSelling";
import Hero from "@/components/Hero";
import Newsletter from "@/components/Newsletter";
import CategoryWiseProducts from "@/components/CategoryWiseProducts";
import LatestProducts from "@/components/LatestProducts";
import StatisticsSection from "@/components/StatisticsSection";
import FAQSection from "@/components/FAQSection";

export default function Home() {
    return (
        <div>
            <Hero />
            <LatestProducts />
            <BestSelling />
            <CategoryWiseProducts />
            <StatisticsSection />
            <FAQSection />
            <Newsletter />
        </div>
    );
}
