import type { Route } from "./+types/review";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resume Review - ResuRev" },
    { name: "description", content: "Your AI-powered resume review results" },
  ];
}

export default function Review() {
  // Mock review data - in real app this would come from your backend based on the ID
  const reviewData = {
    fileName: "Software Engineer Resume.pdf",
    overallScore: 85,
    uploadDate: "2025-01-10",
    categories: [
      {
        name: "ATS Compatibility",
        score: 92,
        status: "excellent",
        feedback: "Your resume is well-optimized for ATS systems with proper formatting and keyword usage."
      },
      {
        name: "Content Quality",
        score: 78,
        status: "good",
        feedback: "Good use of action verbs and quantified achievements. Consider adding more specific metrics."
      },
      {
        name: "Structure & Format",
        score: 88,
        status: "excellent",
        feedback: "Clean, professional layout with clear section divisions and consistent formatting."
      },
      {
        name: "Keywords",
        score: 82,
        status: "good",
        feedback: "Relevant industry keywords present. Consider adding more technical skills specific to your target role."
      }
    ],
    suggestions: [
      {
        priority: "high",
        title: "Add more quantified achievements",
        description: "Include specific numbers, percentages, or metrics to demonstrate your impact."
      },
      {
        priority: "medium",
        title: "Expand technical skills section",
        description: "Add more relevant programming languages and frameworks for software engineering roles."
      },
      {
        priority: "low",
        title: "Consider adding a summary section",
        description: "A brief professional summary can help recruiters quickly understand your value proposition."
      }
    ]
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "excellent":
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case "good":
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      default:
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-l-red-500";
      case "medium": return "border-l-yellow-500";
      case "low": return "border-l-green-500";
      default: return "border-l-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Resume Review Results</h1>
              <p className="text-muted-foreground">{reviewData.fileName}</p>
              <p className="text-sm text-muted-foreground">Analyzed on {reviewData.uploadDate}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                <span className={getScoreColor(reviewData.overallScore)}>
                  {reviewData.overallScore}/100
                </span>
              </div>
              <p className="text-muted-foreground">Overall Score</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Category Scores */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Category Breakdown</h2>
              <div className="space-y-4">
                {reviewData.categories.map((category, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{category.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`font-semibold ${getScoreColor(category.score)}`}>
                          {category.score}/100
                        </span>
                        <span className={getStatusBadge(category.status)}>
                          {category.status}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${category.score}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {category.feedback}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="space-y-6">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Improvement Suggestions</h2>
              <div className="space-y-3">
                {reviewData.suggestions.map((suggestion, index) => (
                  <div 
                    key={index} 
                    className={`border-l-4 pl-4 py-2 ${getPriorityColor(suggestion.priority)}`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-sm">{suggestion.title}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        suggestion.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {suggestion.priority}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {suggestion.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-card rounded-lg border p-6">
              <h3 className="font-semibold mb-4">Next Steps</h3>
              <div className="space-y-3">
                <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium">
                  Download Improved Resume
                </button>
                <button className="w-full border border-border hover:bg-accent px-4 py-2 rounded-md font-medium">
                  Upload New Version
                </button>
                <a 
                  href="/dashboard" 
                  className="w-full border border-border hover:bg-accent px-4 py-2 rounded-md font-medium text-center block"
                >
                  Back to Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
