import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import ServiceCategoryCard from "@/components/ServiceCategoryCard";
import BookingModal from "@/components/BookingModal";
import { categories } from "@/data/services";
import { Link } from "react-router-dom";

const Index = () => {
  const { data: masters = [] } = useQuery({
    queryKey: ["public-masters"],
    queryFn: async () => {
      const { data, error } = await supabase.from("masters").select("*").eq("is_active", true).order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      <HeroSection />

      {/* Services Preview */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-2">Наши направления</p>
            <h2 className="font-heading text-4xl md:text-5xl font-light">Каталог услуг</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <ServiceCategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>


      {/* About Preview */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-2">О салоне</p>
              <h2 className="font-heading text-4xl md:text-5xl font-light mb-6">
                Место, где<br /><span className="italic">время останавливается</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                TERRA — это не просто салон красоты. Это пространство, созданное для тех, кто ценит качество, индивидуальный подход и атмосферу спокойствия.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Мы используем только профессиональную косметику премиум-класса и оборудование последнего поколения. Каждый мастер — эксперт с многолетним опытом.
              </p>
              <Link to="/about" className="text-primary text-sm font-medium tracking-wide border-b border-primary pb-1 hover:opacity-70 transition-opacity">
                Узнать больше →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-sm p-8 text-center">
                <p className="font-heading text-4xl text-primary mb-2">7+</p>
                <p className="text-sm text-muted-foreground">лет работы</p>
              </div>
              <div className="bg-card rounded-sm p-8 text-center">
                <p className="font-heading text-4xl text-primary mb-2">{masters.length}</p>
                <p className="text-sm text-muted-foreground">мастеров</p>
              </div>
              <div className="bg-card rounded-sm p-8 text-center">
                <p className="font-heading text-4xl text-primary mb-2">15+</p>
                <p className="text-sm text-muted-foreground">услуг</p>
              </div>
              <div className="bg-card rounded-sm p-8 text-center">
                <p className="font-heading text-4xl text-primary mb-2">2k+</p>
                <p className="text-sm text-muted-foreground">довольных клиентов</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Masters */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-2">Команда</p>
            <h2 className="font-heading text-4xl md:text-5xl font-light">Наши мастера</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {masters.map((master) => (
              <div key={master.id} className="text-center">
                {master.image_url ? (
                  <img src={master.image_url} alt={master.name} className="w-24 h-24 mx-auto rounded-full object-cover mb-4" />
                ) : (
                  <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                    <span className="font-heading text-2xl text-muted-foreground">
                      {master.name.split(" ").map((n: string) => n[0]).join("")}
                    </span>
                  </div>
                )}
                <h3 className="font-heading text-lg font-medium">{master.name}</h3>
                <p className="text-sm text-muted-foreground">{master.role}</p>
                <p className="text-xs text-muted-foreground mt-1">Опыт: {master.experience}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-heading text-4xl md:text-5xl font-light text-primary-foreground mb-4">
            Запишитесь сегодня
          </h2>
          <p className="text-primary-foreground/70 mb-8 max-w-md mx-auto">
            Выберите удобное время и мастера — мы позаботимся об остальном
          </p>
          <BookingModal
            trigger={
              <button className="px-8 py-3 text-sm font-medium tracking-wide transition-colors rounded-sm text-secondary-foreground bg-primary-foreground">
                Запись на услугу
              </button>
            }
          />
        </div>
      </section>
    </Layout>
  );
};

export default Index;
