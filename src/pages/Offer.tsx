import Layout from "@/components/Layout";

const Offer = () => {
  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-3xl">
          <h1 className="font-heading text-4xl font-light mb-10">Публичная оферта</h1>
          
          <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
            <div>
              <h2 className="font-heading text-xl text-foreground mb-2">1. Общие положения</h2>
              <p>Настоящий документ является официальным предложением (публичной офертой) салона красоты TERRA (далее — «Исполнитель») и содержит все существенные условия оказания услуг.</p>
            </div>
            <div>
              <h2 className="font-heading text-xl text-foreground mb-2">2. Предмет оферты</h2>
              <p>Исполнитель обязуется оказать Заказчику косметологические, парикмахерские и иные услуги в соответствии с прейскурантом, размещённым на сайте.</p>
            </div>
            <div>
              <h2 className="font-heading text-xl text-foreground mb-2">3. Порядок оказания услуг</h2>
              <p>Заказчик выбирает услугу, дату и время визита. Исполнитель подтверждает запись по телефону. Услуга считается оказанной с момента её завершения.</p>
            </div>
            <div>
              <h2 className="font-heading text-xl text-foreground mb-2">4. Стоимость и оплата</h2>
              <p>Стоимость услуг определяется прейскурантом. Оплата производится наличными или банковской картой после оказания услуги.</p>
            </div>
            <div>
              <h2 className="font-heading text-xl text-foreground mb-2">5. Отмена и перенос</h2>
              <p>Заказчик может отменить или перенести запись не позднее чем за 3 часа до назначенного времени.</p>
            </div>
            <div>
              <h2 className="font-heading text-xl text-foreground mb-2">6. Ответственность</h2>
              <p>Исполнитель гарантирует качество оказываемых услуг. В случае неудовлетворённости Заказчик может обратиться с претензией в течение 3 дней.</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Offer;
