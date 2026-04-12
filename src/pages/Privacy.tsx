import Layout from "@/components/Layout";

const Privacy = () => {
  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-3xl">
          <h1 className="font-heading text-4xl font-light mb-10">Политика конфиденциальности</h1>
          
          <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
            <div>
              <h2 className="font-heading text-xl text-foreground mb-2">1. Общие положения</h2>
              <p>Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей сайта салона красоты TERRA (далее — «Салон»).</p>
            </div>
            <div>
              <h2 className="font-heading text-xl text-foreground mb-2">2. Сбор информации</h2>
              <p>Мы собираем информацию, которую вы предоставляете при записи на услуги: имя, номер телефона, адрес электронной почты, предпочтения по услугам.</p>
            </div>
            <div>
              <h2 className="font-heading text-xl text-foreground mb-2">3. Использование информации</h2>
              <p>Собранная информация используется для: обработки заявок на запись, связи с клиентами, улучшения качества обслуживания, отправки информационных сообщений (с согласия пользователя).</p>
            </div>
            <div>
              <h2 className="font-heading text-xl text-foreground mb-2">4. Защита данных</h2>
              <p>Мы принимаем все необходимые меры для защиты ваших персональных данных от несанкционированного доступа, изменения, раскрытия или уничтожения.</p>
            </div>
            <div>
              <h2 className="font-heading text-xl text-foreground mb-2">5. Права пользователей</h2>
              <p>Вы имеете право запросить информацию о хранящихся у нас данных, потребовать их исправления или удаления, обратившись по контактным данным, указанным на сайте.</p>
            </div>
            <div>
              <h2 className="font-heading text-xl text-foreground mb-2">6. Контакты</h2>
              <p>По вопросам обработки персональных данных обращайтесь: +7 (495) 123-45-67, г. Москва, ул. Пример, д. 1.</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Privacy;
