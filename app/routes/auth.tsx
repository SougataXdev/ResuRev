import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { Button } from "app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "app/components/ui/card";
import { usePuterStore } from "~/lib/puter.lib";

export const meta = () => [
  { title: "ResuRev - Sign In" },
  { name: "description", content: "Sign in to your ResuRev account." },
];

const Auth = () => {
  const { isLoading, auth } = usePuterStore();
  const location = useLocation();
  const navigate = useNavigate();
  const next = (() => {
    try {
      const params = new URLSearchParams(location.search);
      return params.get("next") || "/dashboard";
    } catch {
      return "/dashboard";
    }
  })();

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate(next, { replace: true });
    }
  }, [auth.isAuthenticated, next, navigate, auth]);
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="bg-card border p-6 rounded-lg shadow">
          <CardHeader>
            <div className="flex flex-col">
              <CardTitle className="text-lg">Welcome to ResuRev</CardTitle>
              <CardDescription className="text-sm">
                Use Puter to authenticate and access your resume reviews.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="grid gap-4">
            {auth.user ? (
              <div className="text-sm">
                <p className="font-medium">Signed in as</p>
                <p className="truncate text-muted-foreground">
                  {auth.user?.email ?? auth.user?.id}
                </p>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Sign in to view and manage your resumes and reviews.
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            {isLoading ? (
              <Button className="w-full" disabled>
                Signing in...
              </Button>
            ) : auth.isAuthenticated ? (
              <>
                <Button className="w-full" onClick={() => auth.signOut()}>
                  Sign out
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate(next)}
                >
                  Go to dashboard
                </Button>
              </>
            ) : (
              <>
                <Button className="w-full" onClick={() => auth.signIn()}>
                  Sign in with Puter
                </Button>
              </>
            )}

            <p className="text-center text-xs text-muted-foreground mt-1">
              After signing in you will be redirected to your dashboard.
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
};

export default Auth;
