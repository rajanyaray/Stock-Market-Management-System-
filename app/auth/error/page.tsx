import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const params = searchParams;

  return (
    <main className="min-h-screen bg-background">
      <Navbar showLinks={false} />
      <div className="flex min-h-[calc(100vh-72px)] w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  Sorry, something went wrong.
                </CardTitle>
              </CardHeader>
              <CardContent>
                {params?.error ? (
                  <p className="text-sm text-muted-foreground">
                    Code error: {params.error}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    An unspecified error occurred.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
