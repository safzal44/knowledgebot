import { Layout } from "@/components/Layout";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { CheckCircle, XCircle, Book, Clock, Calendar, Users, Shield, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const quickLinks = [
  { icon: Calendar, title: "Leave Policies", description: "Understand your leave entitlements", href: "/policies/leave" },
  { icon: Clock, title: "Working Hours", description: "Office timing and attendance", href: "/policies/attendance" },
  { icon: Users, title: "Code of Conduct", description: "Workplace behavior guidelines", href: "/policies/conduct" },
  { icon: Shield, title: "Your Rights", description: "Employee rights and support", href: "/policies/conduct#rights" },
];

const dos = [
  "Be punctual and maintain regular attendance",
  "Treat all colleagues with respect and dignity",
  "Follow proper leave application procedures",
  "Report any concerns to your supervisor or HR",
  "Keep your contact information updated",
  "Participate actively in team meetings",
  "Maintain confidentiality of sensitive information",
];

const donts = [
  "Share office access cards or passwords",
  "Use office resources for personal matters",
  "Engage in any form of harassment or discrimination",
  "Share confidential organizational data externally",
  "Leave workstation without proper handover",
  "Skip mandatory training sessions without approval",
];

export default function OnboardingPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-16 animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-success/10 text-success rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Heart className="h-4 w-4" />
            Welcome to the Team!
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            New Staff Start Here
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know to get started at our organization. 
            This guide covers essential policies, workplace rules, and your responsibilities.
          </p>
        </div>

        {/* Quick Links */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">Essential Resources</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <link.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                  {link.title}
                </h3>
                <p className="text-sm text-muted-foreground">{link.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Office Basics */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">Office Basics</h2>
          <div className="bg-card border border-border rounded-xl p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Working Hours
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="font-medium text-foreground">9:00 AM - 5:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Lunch Break</span>
                    <span className="font-medium text-foreground">1:00 PM - 2:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Weekly Hours</span>
                    <span className="font-medium text-foreground">40 hours</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Leave Entitlements
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex justify-between">
                    <span>Annual Leave</span>
                    <span className="font-medium text-foreground">18 days/year</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Sick Leave</span>
                    <span className="font-medium text-foreground">12 days/year</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Casual Leave</span>
                    <span className="font-medium text-foreground">6 days/year</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Do's and Don'ts */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">Workplace Do's and Don'ts</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Do's */}
            <div className="bg-success/5 border border-success/20 rounded-xl p-6">
              <h3 className="font-semibold text-success mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Do's
              </h3>
              <ul className="space-y-3">
                {dos.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Don'ts */}
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6">
              <h3 className="font-semibold text-destructive mb-4 flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                Don'ts
              </h3>
              <ul className="space-y-3">
                {donts.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-muted-foreground">
                    <XCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Probation Info */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">Probation Period</h2>
          <div className="bg-card border border-border rounded-xl p-8">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-xl">
                <Book className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Your First 3 Months</h3>
                <p className="text-muted-foreground mb-4">
                  All new employees undergo a 3-month probation period. During this time:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• You'll receive regular feedback from your supervisor</li>
                  <li>• Complete all mandatory training sessions</li>
                  <li>• Demonstrate alignment with organizational values</li>
                  <li>• Meet the basic performance expectations of your role</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Upon successful completion, you'll receive a confirmation letter.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Need Help */}
        <section className="mb-12">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold text-foreground mb-2">Need Help?</h3>
            <p className="text-muted-foreground mb-4">
              Have questions not covered here? Use our AI assistant or contact HR directly.
            </p>
            <Link
              to="/ask"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Ask the HR Assistant
            </Link>
          </div>
        </section>

        <DisclaimerBanner />
      </div>
    </Layout>
  );
}
