import { Link } from "react-router-dom";
import { CategoryInfo } from "@/data/services";

const ServiceCategoryCard = ({ category }: { category: CategoryInfo }) => {
  return (
    <Link
      to={`/services?category=${category.id}`}
      className="group relative overflow-hidden rounded-sm aspect-[3/4] block"
    >
      <img
        src={category.image}
        alt={category.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
        width={800}
        height={1024}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="font-heading text-2xl text-primary-foreground font-medium mb-1">{category.title}</h3>
        <p className="text-primary-foreground/60 text-sm">{category.description}</p>
      </div>
    </Link>
  );
};

export default ServiceCategoryCard;
