"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ThemeToggle from "@/components/ThemeToggle";

interface NavbarProps {
  userEmail?: string;
  showLinks?: boolean;
}

export default function Navbar({ userEmail, showLinks = false }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) {
        toast.error("Logout failed");
        return;
      }
      toast.success("Logged out");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  return (
    <nav className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href={userEmail ? "/dashboard" : "/"}>
          <h1 className="text-xl font-bold text-foreground hover:text-primary transition-colors">
            Stock Market Manager
          </h1>
        </Link>

        <div className="flex items-center gap-4">
          {showLinks && userEmail && (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Link href="/transactions">
                <Button variant="ghost" size="sm">
                  Transactions
                </Button>
              </Link>
            </>
          )}
          {showLinks && userEmail && (
            <>
              <span className="text-sm text-muted-foreground">{userEmail}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
