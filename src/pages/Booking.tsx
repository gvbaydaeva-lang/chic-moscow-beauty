import Layout from "@/components/Layout";
import BookingModal from "@/components/BookingModal";

const Booking = () => {
  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-lg text-center">
          <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-2">Запись</p>
          <h1 className="font-heading text-4xl md:text-5xl font-light mb-6">Записаться на приём</h1>
          <p className="text-muted-foreground mb-8">
            Выберите удобную услугу, мастера, дату и время — мы перезвоним для подтверждения.
          </p>
          <BookingModal
            trigger={
              <button className="bg-primary text-primary-foreground px-8 py-3 text-sm font-medium tracking-wide hover:bg-primary/90 transition-colors rounded-sm">
                Открыть форму записи
              </button>
            }
          />
        </div>
      </section>
    </Layout>
  );
};

export default Booking;
