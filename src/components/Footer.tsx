import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <h3 className="font-heading text-3xl font-semibold mb-4">TERRA</h3>
            <p className="text-primary-foreground/60 text-sm leading-relaxed max-w-sm">
              Салон красоты в самом сердце Москвы. Мы создаём пространство, где забота о себе становится искусством.
            </p>
          </div>

          <div>
            <h4 className="font-heading text-lg font-medium mb-4">Навигация</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">Главная</Link>
              <Link to="/services" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">Услуги</Link>
              <Link to="/about" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">О салоне</Link>
              <Link to="/booking" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">Запись</Link>
            </div>
          </div>

          <div>
            <h4 className="font-heading text-lg font-medium mb-4">Документы</h4>
            <div className="flex flex-col gap-2">
              <Link to="/privacy" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">Политика конфиденциальности</Link>
              <Link to="/offer" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">Публичная оферта</Link>
            </div>
            <h4 className="font-heading text-lg font-medium mb-2 mt-6">Контакты</h4>
            <p className="text-sm text-primary-foreground/60">+7 (495) 123-45-67</p>
            <p className="text-sm text-primary-foreground/60">г. Москва, ул. Пример, д. 1</p>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-6 text-center">
          <p className="text-xs text-primary-foreground/40">© {new Date().getFullYear()} TERRA. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
