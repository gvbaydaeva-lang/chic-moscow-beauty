import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import BookingModal from "@/components/BookingModal";
import { categories, services, type ServiceCategory } from "@/data/services";

const Services = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = (searchParams.get("category") as ServiceCategory) || null;

  const filtered = activeCategory
    ? services.filter(s => s.category === activeCategory)
    : services;

  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-2">Каталог</p>
            <h1 className="font-heading text-4xl md:text-5xl font-light">Наши услуги</h1>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
              onClick={() => setSearchParams({})}
              className={`px-5 py-2 text-sm font-medium tracking-wide rounded-sm transition-colors ${
                !activeCategory ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Все
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSearchParams({ category: cat.id })}
                className={`px-5 py-2 text-sm font-medium tracking-wide rounded-sm transition-colors ${
                  activeCategory === cat.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(service => (
              <div key={service.id} className="bg-card border border-border rounded-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-heading text-xl font-medium">{service.title}</h3>
                  <span className="text-primary font-medium text-sm whitespace-nowrap ml-4">
                    {service.price.toLocaleString("ru-RU")} ₽
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{service.duration}</span>
                  <BookingModal
                    preselectedServiceId={service.id}
                    trigger={
                      <button className="text-primary text-sm font-medium hover:underline">
                        Записаться →
                      </button>
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
