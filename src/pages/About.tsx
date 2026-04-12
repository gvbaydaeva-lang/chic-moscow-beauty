import Layout from "@/components/Layout";
import { masters } from "@/data/services";
import heroImage from "@/assets/hero-salon.jpg";

const About = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img src={heroImage} alt="Интерьер салона" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="relative z-10 container mx-auto px-6 h-full flex items-center">
          <div>
            <p className="text-primary-foreground/70 text-sm tracking-[0.3em] uppercase mb-3">О нас</p>
            <h1 className="font-heading text-5xl md:text-6xl font-light text-primary-foreground">О салоне TERRA</h1>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="font-heading text-3xl font-light mb-6 text-center italic">Наша философия</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            TERRA — это место, где красота рождается из внимания к деталям. Мы основали салон в 2018 году с простой идеей: создать пространство, где каждый гость чувствует себя особенным.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Наш подход — это баланс между технологиями и чуткостью. Мы не гонимся за трендами, а предлагаем решения, которые подчёркивают индивидуальность каждого клиента.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Название TERRA означает «земля» — мы верим в натуральность, заземлённость и гармонию с собой.
          </p>
        </div>
      </section>

      {/* Masters */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-2">Команда</p>
            <h2 className="font-heading text-4xl font-light">Наши мастера</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {masters.map(master => (
              <div key={master.id} className="bg-card rounded-sm p-8 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                  <span className="font-heading text-xl text-muted-foreground">
                    {master.name.split(" ").map(n => n[0]).join("")}
                  </span>
                </div>
                <h3 className="font-heading text-xl font-medium mb-1">{master.name}</h3>
                <p className="text-primary text-sm font-medium mb-2">{master.role}</p>
                <p className="text-xs text-muted-foreground">Опыт работы: {master.experience}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipment */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-10">
            <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-2">Качество</p>
            <h2 className="font-heading text-4xl font-light">Оборудование и косметика</h2>
          </div>
          <div className="space-y-6">
            {[
              { title: "Профессиональная косметика", desc: "Мы работаем с брендами Kerastase, Wella, OPI, Dermalogica и другими лидерами индустрии." },
              { title: "Современное оборудование", desc: "Лазерные аппараты, LED-лампы, массажные столы премиум-класса — мы инвестируем в лучшее." },
              { title: "Стерильность и безопасность", desc: "Все инструменты проходят многоступенчатую стерилизацию. Одноразовые материалы — стандарт." },
            ].map((item, i) => (
              <div key={i} className="border-l-2 border-primary pl-6">
                <h3 className="font-heading text-xl font-medium mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
