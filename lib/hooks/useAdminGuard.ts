"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

/**
 * Hook that gates admin pages.
 * Returns { isAdmin, isLoading, userEmail, adminRole, adminRules }.
 * Redirects non-admin users to "/" automatically.
 */
export function useAdminGuard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [adminRules, setAdminRules] = useState<any>({});

  useEffect(() => {
    async function checkAdmin() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          router.replace("/auth");
          return;
        }

        const email = session.user.email?.toLowerCase() || "";
        setUserEmail(email);

        // Fetch user from AdminUser table safely
        let adminRecord = null;
        try {
          const { data, error } = await supabase
            .from("AdminUser")
            .select("*")
            .eq("email", email)
            .maybeSingle();
          if (!error && data) {
            adminRecord = data;
          }
        } catch (dbErr) {
          console.warn("Could not query AdminUser table, using fallback:", dbErr);
        }

        if (adminRecord) {
          setIsAdmin(true);
          setAdminRole(adminRecord.role);
          setAdminRules(adminRecord.rules || {});
        } else if (email === "minamakr1234@gmail.com") {
          // Hardcoded bypass fallback for the master superadmin
          setIsAdmin(true);
          setAdminRole("superadmin");
          setAdminRules({ canManageUsers: true, canManageOrders: true, canManageTickets: true });
        } else {
          router.replace("/");
        }
      } catch (err) {
        console.error("Admin guard error:", err);
        router.replace("/");
      } finally {
        setIsLoading(false);
      }
    }

    checkAdmin();
  }, [router]);

  return { isAdmin, isLoading, userEmail, adminRole, adminRules };
}

/**
 * Check if a given email has admin privileges (fallback check for layout buttons).
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase() === "minamakr1234@gmail.com";
}

