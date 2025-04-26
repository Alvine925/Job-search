import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { jobCategories } from "@shared/schema";

import { 
  Code, 
  DollarSign, 
  Stethoscope, 
  GraduationCap,
  ShoppingBag,
  BarChart,
  Paintbrush,
  Headphones
} from "lucide-react";

// Map category names to icons
const categoryIcons: Record<string, React.ReactNode> = {
  "Technology": <Code className="h-6 w-6 text-primary" />,
  "Finance": <DollarSign className="h-6 w-6 text-primary" />,
  "Healthcare": <Stethoscope className="h-6 w-6 text-primary" />,
  "Education": <GraduationCap className="h-6 w-6 text-primary" />,
  "Retail": <ShoppingBag className="h-6 w-6 text-primary" />,
  "Marketing": <BarChart className="h-6 w-6 text-primary" />,
  "Design": <Paintbrush className="h-6 w-6 text-primary" />,
  "Customer Service": <Headphones className="h-6 w-6 text-primary" />
};

export default function CategorySection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center text-secondary mb-4">Browse Jobs by Category</h2>
        <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
          Explore opportunities across industries and find the perfect role that matches your expertise.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {jobCategories.map((category) => (
            <Link 
              key={category.id} 
              href={`/jobs?category=${category.name}`}
              className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition flex flex-col items-center text-center group"
            >
              <div className="bg-blue-100 p-3 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
                {categoryIcons[category.name] || <Code className="h-6 w-6 text-primary" />}
              </div>
              <h3 className="font-medium text-secondary mb-1">{category.name}</h3>
              <p className="text-sm text-slate-500">{category.count} jobs</p>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Link 
            href="/jobs" 
            className="inline-flex items-center text-primary hover:text-blue-700 font-medium"
          >
            View all categories
            <ChevronRight className="h-5 w-5 ml-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
