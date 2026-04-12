import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-salon.jpg";

const HeroSection = () => {
  return (
    <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
      <img
        src={heroImage}
        alt="Интерьер салона TERRA"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
      
      <div className="relative z-10 container mx-auto px-6 h-full flex items-center">
        <div className="max-w-xl">
          <p className="text-primary-foreground/70 text-sm tracking-[0.3em] uppercase mb-4 font-body animate-fade-in">
            Салон красоты в Москве
          </p>
          <h1 className="font-heading text-5xl md:text-7xl font-light text-primary-foreground leading-[1.1] mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Красота —<br />
            <span className="italic">это ритуал</span>
          </h1>
          <p className="text-primary-foreground/70 text-base leading-relaxed mb-8 max-w-md animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Пространство, где профессионализм встречается с заботой. Мы создаём индивидуальный подход для каждого гостя.
          </p>
          <div className="flex gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Link
              to="/booking"
              className="bg-primary text-primary-foreground px-8 py-3 text-sm font-medium tracking-wide hover:bg-primary/90 transition-colors rounded-sm"
            >
              Записаться
            </Link>
            <Link
              to="/services"
              className="border border-primary-foreground/30 text-primary-foreground px-8 py-3 text-sm font-medium tracking-wide hover:bg-primary-foreground/10 transition-colors rounded-sm"
            >
              Каталог услуг
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
