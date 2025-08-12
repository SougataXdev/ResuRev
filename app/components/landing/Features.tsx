import AnimatedSection from "../ui/animator";

export default function Features() {
  const features = [
    {
      title: "AI-Powered Analysis",
      description:
        "Advanced algorithms analyze your resume for content, structure, and ATS compatibility.",
      icon: "🤖",
    },
    {
      title: "Instant Feedback",
      description:
        "Get detailed feedback and suggestions within seconds of uploading your resume.",
      icon: "⚡",
    },
    {
      title: "ATS Optimization",
      description:
        "Ensure your resume passes through Applicant Tracking Systems successfully.",
      icon: "✅",
    },
    {
      title: "Industry Insights",
      description:
        "Tailored recommendations based on your target industry and role.",
      icon: "📊",
    },
    {
      title: "Multiple Formats",
      description:
        "Support for PDF, DOC, and DOCX formats with intelligent parsing.",
      icon: "📄",
    },
    {
      title: "Score Tracking",
      description:
        "Track your resume improvements with detailed scoring metrics.",
      icon: "📈",
    },
  ];

  return (
    <AnimatedSection>
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to create a winning resume that gets you hired
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AnimatedSection>
  );
}
