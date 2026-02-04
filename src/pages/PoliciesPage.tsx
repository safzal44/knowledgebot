import { Layout } from "@/components/Layout";
import { PolicySection } from "@/components/PolicySection";
import { SearchBar } from "@/components/SearchBar";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

const policySections = [
  {
    title: "Leave Policies",
    items: [
      { title: "Annual Leave", href: "/policies/leave#annual", description: "Yearly leave entitlement and rules" },
      { title: "Sick Leave", href: "/policies/leave#sick", description: "Medical leave guidelines" },
      { title: "Casual Leave", href: "/policies/leave#casual", description: "Short-term personal leave" },
      { title: "Unpaid Leave", href: "/policies/leave#unpaid", description: "Leave without pay policies" },
    ],
  },
  {
    title: "Attendance & Working Hours",
    items: [
      { title: "Office Hours", href: "/policies/attendance#hours", description: "Standard working hours" },
      { title: "Punctuality", href: "/policies/attendance#punctuality", description: "Attendance expectations" },
      { title: "Remote Work", href: "/policies/attendance#remote", description: "Work from home guidelines" },
    ],
  },
  {
    title: "Employment Process",
    items: [
      { title: "Probation Period", href: "/policies/probation", description: "Trial period guidelines" },
      { title: "Performance Reviews", href: "/policies/performance", description: "Evaluation process" },
      { title: "Confirmation Process", href: "/policies/probation#confirmation", description: "After probation" },
    ],
  },
  {
    title: "Workplace Standards",
    items: [
      { title: "Code of Conduct", href: "/policies/conduct", description: "Professional behavior" },
      { title: "Disciplinary Process", href: "/policies/disciplinary", description: "Corrective actions" },
      { title: "Grievance Procedure", href: "/policies/conduct#grievance", description: "Raising concerns" },
    ],
  },
];

export default function PoliciesPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-up">
            <h1 className="text-4xl font-bold text-foreground mb-4">HR Policies</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Browse all HR policies and guidelines. Use the search to find specific information.
            </p>
            <div className="max-w-2xl mx-auto">
              <SearchBar placeholder="Search policies..." />
            </div>
          </div>

          {/* Policy Sections */}
          <div className="space-y-8 animate-fade-in">
            {policySections.map((section) => (
              <PolicySection key={section.title} {...section} />
            ))}
          </div>

          {/* Disclaimer */}
          <div className="mt-12">
            <DisclaimerBanner compact />
          </div>
        </div>
      </div>
    </Layout>
  );
}
