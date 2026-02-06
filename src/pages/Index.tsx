import { Layout } from "@/components/Layout";
import { SearchBar } from "@/components/SearchBar";
import { CategoryCard } from "@/components/CategoryCard";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { Book, Calendar, Users, Scale, Award, FileText, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-illustration.png";

const categories = [
  {
    title: "Leave Policies",
    description: "Casual, sick, annual, and unpaid leave guidelines and procedures",
    icon: Calendar,
    href: "/policies/leave",
    color: "primary" as const,
  },
  {
    title: "Attendance & Hours",
    description: "Working hours, timekeeping, and attendance requirements",
    icon: FileText,
    href: "/policies/attendance",
    color: "info" as const,
  },
  {
    title: "Probation & Confirmation",
    description: "Probation period details and confirmation process",
    icon: Award,
    href: "/policies/probation",
    color: "success" as const,
  },
  {
    title: "Code of Conduct",
    description: "Professional behavior standards and workplace ethics",
    icon: Scale,
    href: "/policies/conduct",
    color: "accent" as const,
  },
  {
    title: "Performance Reviews",
    description: "Evaluation process and performance management overview",
    icon: Award,
    href: "/policies/performance",
    color: "primary" as const,
  },
  {
    title: "Disciplinary Process",
    description: "High-level overview of disciplinary procedures",
    icon: Book,
    href: "/policies/disciplinary",
    color: "info" as const,
  },
];

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                AI-Powered Policy Support
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                Your Policy Questions,{" "}
                <span className="text-primary">Answered Instantly</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Find answers to all your policy questions in one place. 
                Our AI assistant helps you understand leave policies, attendance rules, 
                and workplace guidelines quickly and clearly.
              </p>
              
              <SearchBar large placeholder="Ask any policy question... e.g., 'How many sick days do I get?'" />

              <div className="mt-6 flex items-center gap-4">
                <Link
                  to="/onboarding"
                  className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
                >
                  <Users className="h-4 w-4" />
                  New Staff? Start Here
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="hidden lg:block animate-fade-in">
              <img
                src={heroImage}
                alt="Team collaboration illustration"
                className="w-full rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Browse Policies</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our comprehensive collection of policies and guidelines organized by category
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.href} {...category} />
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Ask AI Card */}
            <Link
              to="/ask"
              className="group relative overflow-hidden rounded-2xl bg-primary p-8 text-primary-foreground transition-transform hover:-translate-y-1"
            >
              <div className="relative z-10">
                <Sparkles className="h-10 w-10 mb-4 opacity-90" />
                <h3 className="text-2xl font-bold mb-2">Ask the Policy Assistant</h3>
                <p className="opacity-90 mb-4">
                  Get instant answers to your policy questions using our AI-powered assistant
                </p>
                <span className="inline-flex items-center gap-2 font-medium">
                  Start asking <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
              <div className="absolute right-0 bottom-0 opacity-10">
                <Sparkles className="h-40 w-40" />
              </div>
            </Link>

            {/* New Staff Card */}
            <Link
              to="/onboarding"
              className="group relative overflow-hidden rounded-2xl bg-card border-2 border-border p-8 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
            >
              <div className="relative z-10">
                <Users className="h-10 w-10 mb-4 text-primary" />
                <h3 className="text-2xl font-bold text-foreground mb-2">New Staff Start Here</h3>
                <p className="text-muted-foreground mb-4">
                  Essential information for new team members to get started quickly
                </p>
                <span className="inline-flex items-center gap-2 font-medium text-primary">
                  View onboarding guide <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <DisclaimerBanner />
        </div>
      </section>
    </Layout>
  );
}
