"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

export default function PageLoader() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    NProgress.configure({ showSpinner: false });

    const handleStart = () => NProgress.start();
    const handleStop = () => NProgress.done();

    router.prefetch(pathname); // Prefetch for faster navigation
    handleStart();
    handleStop();
  }, [router,pathname]);

  return null;
}
