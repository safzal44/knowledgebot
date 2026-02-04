import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface PolicyItem {
  title: string;
  href: string;
  description?: string;
}

interface PolicySectionProps {
  title: string;
  items: PolicyItem[];
}

export function PolicySection({ title, items }: PolicySectionProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              to={item.href}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors group"
            >
              <div>
                <span className="text-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </span>
                {item.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
