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
          <span className="tradezy-logo text-2xl font-extrabold tracking-wider">
            Tradezy
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {showLinks && userEmail && (
            <div className="flex gap-1">
              <Link href="/dashboard" className="nav-link text-sm">
                Dashboard
              </Link>
              <Link href="/transactions" className="nav-link text-sm">
                Transactions
              </Link>
            </div>
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
