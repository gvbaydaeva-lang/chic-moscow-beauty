import nailsImg from "@/assets/service-nails.jpg";
import hairImg from "@/assets/service-hair.jpg";
import massageImg from "@/assets/service-massage.jpg";
import skincareImg from "@/assets/service-skincare.jpg";
import makeupImg from "@/assets/service-makeup.jpg";

export type ServiceCategory = "nails" | "hair" | "massage" | "skincare" | "makeup";

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  category: ServiceCategory;
}

export interface CategoryInfo {
  id: ServiceCategory;
  title: string;
  description: string;
  image: string;
}

export const categories: CategoryInfo[] = [
  { id: "nails", title: "Ногти", description: "Маникюр, педикюр, наращивание и дизайн ногтей", image: nailsImg },
  { id: "hair", title: "Волосы", description: "Стрижки, окрашивание, укладки и уходовые процедуры", image: hairImg },
  { id: "massage", title: "Массаж", description: "Классический, релакс, антицеллюлитный и лечебный массаж", image: massageImg },
  { id: "skincare", title: "Уход", description: "Чистки, пилинги, мезотерапия и уходовые программы", image: skincareImg },
  { id: "makeup", title: "Макияж", description: "Дневной, вечерний, свадебный макияж и оформление бровей", image: makeupImg },
];

export const services: Service[] = [
  { id: "1", title: "Классический маникюр", description: "Обработка кутикулы, придание формы ногтям, покрытие лаком", price: 2000, duration: "1 час", category: "nails" },
  { id: "2", title: "Маникюр с гель-лаком", description: "Маникюр с долговременным покрытием гель-лаком", price: 3000, duration: "1.5 часа", category: "nails" },
  { id: "3", title: "Наращивание ногтей", description: "Моделирование ногтей гелем или акрилом", price: 5000, duration: "2.5 часа", category: "nails" },
  { id: "4", title: "Женская стрижка", description: "Стрижка любой сложности с мытьём и укладкой", price: 4000, duration: "1 час", category: "hair" },
  { id: "5", title: "Окрашивание", description: "Однотонное окрашивание профессиональными красителями", price: 6000, duration: "2 часа", category: "hair" },
  { id: "6", title: "Балаяж / Шатуш", description: "Сложное окрашивание с эффектом выгоревших прядей", price: 10000, duration: "3.5 часа", category: "hair" },
  { id: "7", title: "Укладка", description: "Салонная укладка: локоны, объём, гладкие волны", price: 3000, duration: "45 мин", category: "hair" },
  { id: "8", title: "Классический массаж", description: "Общий массаж тела для расслабления и снятия напряжения", price: 4500, duration: "1 час", category: "massage" },
  { id: "9", title: "Антицеллюлитный массаж", description: "Интенсивный массаж проблемных зон", price: 5000, duration: "1 час", category: "massage" },
  { id: "10", title: "Массаж горячими камнями", description: "Стоун-терапия для глубокого расслабления", price: 6000, duration: "1.5 часа", category: "massage" },
  { id: "11", title: "Чистка лица", description: "Комбинированная чистка с уходовой маской", price: 4500, duration: "1.5 часа", category: "skincare" },
  { id: "12", title: "Пилинг", description: "Химический пилинг для обновления кожи", price: 3500, duration: "45 мин", category: "skincare" },
  { id: "13", title: "Мезотерапия", description: "Инъекционная процедура для увлажнения и омоложения", price: 7000, duration: "1 час", category: "skincare" },
  { id: "14", title: "Дневной макияж", description: "Лёгкий натуральный макияж на каждый день", price: 3000, duration: "45 мин", category: "makeup" },
  { id: "15", title: "Вечерний макияж", description: "Яркий макияж для особых случаев", price: 4500, duration: "1 час", category: "makeup" },
  { id: "16", title: "Свадебный макияж", description: "Стойкий макияж с пробным вариантом", price: 8000, duration: "1.5 часа", category: "makeup" },
  { id: "17", title: "Оформление бровей", description: "Коррекция, окрашивание и ламинирование бровей", price: 2500, duration: "40 мин", category: "makeup" },
];

export const masters = [
  { id: "1", name: "Анна Иванова", role: "Топ-стилист", specialties: ["hair"], experience: "12 лет" },
  { id: "2", name: "Мария Бадмаева", role: "Мастер маникюра", specialties: ["nails"], experience: "8 лет" },
  { id: "3", name: "Елена Петрова", role: "Косметолог", specialties: ["skincare"], experience: "10 лет" },
  { id: "4", name: "Ольга Смирнова", role: "Массажист", specialties: ["massage"], experience: "6 лет" },
  { id: "5", name: "Дарья Волкова", role: "Визажист", specialties: ["makeup"], experience: "9 лет" },
];
