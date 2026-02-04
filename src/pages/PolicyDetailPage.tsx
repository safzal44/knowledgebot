import { Layout } from "@/components/Layout";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Award, Scale, FileText, Book } from "lucide-react";

const policyContent: Record<string, { title: string; icon: any; sections: { heading: string; content: string[] }[] }> = {
  leave: {
    title: "Leave Policies",
    icon: Calendar,
    sections: [
      {
        heading: "Annual Leave",
        content: [
          "All confirmed employees are entitled to 18 working days of annual leave per calendar year.",
          "Leave must be applied for at least 3 working days in advance.",
          "Annual leave can be carried forward to the next year, up to a maximum of 5 days.",
          "Unused leave beyond 5 days will lapse at year-end.",
          "During probation, annual leave is accrued but typically cannot be taken unless approved.",
        ],
      },
      {
        heading: "Sick Leave",
        content: [
          "Employees are entitled to 12 days of sick leave per year.",
          "For absences of more than 2 consecutive days, a medical certificate is required.",
          "Inform your supervisor as early as possible on the day of absence.",
          "Unused sick leave does not carry forward to the next year.",
          "Extended medical leave may be considered on a case-by-case basis.",
        ],
      },
      {
        heading: "Casual Leave",
        content: [
          "6 days of casual leave are provided per year for personal matters.",
          "Apply at least 1 day in advance when possible.",
          "Casual leave cannot exceed 2 consecutive days at a time.",
          "Not applicable for planned vacations—use annual leave instead.",
        ],
      },
      {
        heading: "Unpaid Leave",
        content: [
          "Unpaid leave may be granted in exceptional circumstances.",
          "Must be approved by department head and HR.",
          "Extended unpaid leave may affect benefits and tenure calculations.",
          "Please confirm with HR/Admin for specific situations.",
        ],
      },
    ],
  },
  attendance: {
    title: "Attendance & Working Hours",
    icon: Clock,
    sections: [
      {
        heading: "Standard Working Hours",
        content: [
          "Regular office hours are Monday to Friday, 9:00 AM to 5:00 PM.",
          "A one-hour lunch break is scheduled from 1:00 PM to 2:00 PM.",
          "Total weekly working hours: 40 hours.",
          "Flexible timing may be available with supervisor approval.",
        ],
      },
      {
        heading: "Punctuality Expectations",
        content: [
          "All staff are expected to arrive on time.",
          "Repeated late arrivals may result in counseling.",
          "If you will be late, inform your supervisor immediately.",
          "Attendance records are maintained and reviewed monthly.",
        ],
      },
      {
        heading: "Remote Work Guidelines",
        content: [
          "Remote work arrangements must be pre-approved.",
          "Maintain regular communication during remote work days.",
          "Ensure you have proper equipment and internet connectivity.",
          "Attendance tracking applies equally to remote work days.",
        ],
      },
    ],
  },
  probation: {
    title: "Probation & Confirmation",
    icon: Award,
    sections: [
      {
        heading: "Probation Period",
        content: [
          "All new employees serve a 3-month probation period.",
          "During probation, you'll receive regular feedback from your supervisor.",
          "Performance, attendance, and conduct are evaluated.",
          "Probation may be extended if performance needs improvement.",
        ],
      },
      {
        heading: "Confirmation Process",
        content: [
          "Upon successful completion of probation, employees receive a confirmation letter.",
          "Full benefits become applicable after confirmation.",
          "Annual leave accrued during probation becomes accessible.",
          "Confirmation is based on supervisor evaluation and HR review.",
        ],
      },
    ],
  },
  conduct: {
    title: "Code of Conduct",
    icon: Scale,
    sections: [
      {
        heading: "Professional Behavior",
        content: [
          "Treat all colleagues, partners, and beneficiaries with respect and dignity.",
          "Maintain honesty and integrity in all professional dealings.",
          "Dress appropriately for the workplace and field visits.",
          "Represent the organization positively at all times.",
        ],
      },
      {
        heading: "Workplace Ethics",
        content: [
          "Avoid conflicts of interest in all professional activities.",
          "Do not accept gifts or favors that may influence your work.",
          "Report any unethical behavior to your supervisor or HR.",
          "Maintain confidentiality of sensitive organizational information.",
        ],
      },
      {
        heading: "Harassment & Discrimination",
        content: [
          "The organization has zero tolerance for harassment of any kind.",
          "Discrimination based on gender, religion, ethnicity, or disability is strictly prohibited.",
          "Report any incidents immediately to HR for investigation.",
          "All complaints are treated confidentially.",
        ],
      },
      {
        heading: "Grievance Procedure",
        content: [
          "Employees may raise concerns with their immediate supervisor first.",
          "If unresolved, escalate to HR or the designated grievance committee.",
          "Written complaints ensure proper documentation and follow-up.",
          "Retaliation against employees raising legitimate concerns is prohibited.",
        ],
      },
    ],
  },
  performance: {
    title: "Performance Reviews",
    icon: FileText,
    sections: [
      {
        heading: "Evaluation Process",
        content: [
          "Performance reviews are conducted annually.",
          "Mid-year check-ins help track progress toward goals.",
          "Self-assessment forms are part of the review process.",
          "Feedback is given constructively with a focus on development.",
        ],
      },
      {
        heading: "Performance Goals",
        content: [
          "Goals are set collaboratively with your supervisor at the start of each year.",
          "Goals should be SMART: Specific, Measurable, Achievable, Relevant, Time-bound.",
          "Regular progress discussions are encouraged throughout the year.",
        ],
      },
    ],
  },
  disciplinary: {
    title: "Disciplinary Process",
    icon: Book,
    sections: [
      {
        heading: "Overview",
        content: [
          "The disciplinary process aims to address misconduct fairly and consistently.",
          "It follows a progressive approach: verbal warning, written warning, final warning.",
          "Serious misconduct may result in immediate escalation.",
          "All employees have the right to respond to allegations.",
        ],
      },
      {
        heading: "Types of Misconduct",
        content: [
          "Minor: Tardiness, minor policy violations, unprofessional behavior.",
          "Major: Repeated minor offenses, negligence, insubordination.",
          "Gross: Fraud, theft, harassment, violence, serious breach of trust.",
        ],
      },
      {
        heading: "Your Rights",
        content: [
          "You will be informed of any allegations in writing.",
          "You have the right to present your side before any decision.",
          "You may appeal disciplinary decisions through proper channels.",
          "Please confirm with HR/Admin for specific procedures.",
        ],
      },
    ],
  },
};

export default function PolicyDetailPage() {
  const { policyId } = useParams<{ policyId: string }>();
  const policy = policyId ? policyContent[policyId] : null;

  if (!policy) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Policy Not Found</h1>
          <Link to="/policies" className="text-primary hover:underline">
            Back to Policies
          </Link>
        </div>
      </Layout>
    );
  }

  const IconComponent = policy.icon;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Back Link */}
          <Link
            to="/policies"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Policies
          </Link>

          {/* Header */}
          <div className="flex items-center gap-4 mb-8 animate-slide-up">
            <div className="bg-primary/10 p-4 rounded-xl">
              <IconComponent className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">{policy.title}</h1>
          </div>

          {/* Content */}
          <div className="space-y-8 animate-fade-in">
            {policy.sections.map((section, index) => (
              <section key={index} id={section.heading.toLowerCase().replace(/\s+/g, "-")} className="scroll-mt-24">
                <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border">
                  {section.heading}
                </h2>
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-muted-foreground leading-relaxed pl-4 border-l-2 border-primary/20">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
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
