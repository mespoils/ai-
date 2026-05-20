"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      if (data.user) {
        fetch("/api/credits")
          .then((r) => r.json())
          .then((d) => setCredits(d.credits))
          .catch(() => {});
      }
    });
  }, [pathname]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setCredits(null);
    router.push("/");
  }

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-lg text-blue-600">
            AI文案
          </Link>
          <Link
            href="/generate"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            生成文案
          </Link>
          {user && (
            <Link
              href="/history"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              历史记录
            </Link>
          )}
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {credits !== null && (
                <span className="text-sm text-gray-500">
                  积分:{" "}
                  <span className="font-semibold text-blue-600">
                    {credits}
                  </span>
                </span>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                退出
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm">
                登录
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
