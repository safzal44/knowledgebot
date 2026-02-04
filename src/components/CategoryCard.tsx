import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color?: "primary" | "accent" | "success" | "info";
}

const colorClasses = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent-foreground",
  success: "bg-success/10 text-success",
  info: "bg-info/10 text-info",
};

export function CategoryCard({ title, description, icon: Icon, href, color = "primary" }: CategoryCardProps) {
  return (
    <Link to={href} className="category-card group block">
      <div className={`inline-flex p-3 rounded-xl mb-4 ${colorClasses[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </Link>
  );
}
