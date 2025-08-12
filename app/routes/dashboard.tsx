import type { Route } from "./+types/dashboard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - ResuRev" },
    { name: "description", content: "Your ResuRev dashboard" },
  ];
}

export default function Dashboard() {
  // Mock data - in real app this would come from your backend
  const resumes = [
    {
      id: 1,
      name: "Software Engineer Resume.pdf",
      score: 85,
      status: "completed",
      uploadDate: "2025-01-10",
    },
    {
      id: 2,
      name: "Marketing Manager Resume.pdf",
      score: 72,
      status: "completed",
      uploadDate: "2025-01-08",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Manage your resumes and reviews</p>
          </div>
          <a
            href="/upload"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium"
          >
            Upload New Resume
          </a>
        </div>

        <div className="grid gap-6">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Reviews</h2>
            
            {resumes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No resumes uploaded yet</p>
                <a
                  href="/upload"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium inline-block"
                >
                  Upload Your First Resume
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div>
                      <h3 className="font-medium">{resume.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Uploaded on {resume.uploadDate}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-semibold">Score: {resume.score}/100</div>
                        <div className={`text-sm ${
                          resume.score >= 80 ? 'text-green-600' :
                          resume.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {resume.score >= 80 ? 'Excellent' :
                           resume.score >= 60 ? 'Good' : 'Needs Improvement'}
                        </div>
                      </div>
                      <a
                        href={`/review/${resume.id}`}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1 rounded text-sm"
                      >
                        View Review
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
