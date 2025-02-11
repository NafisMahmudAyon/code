import { FeaturedSnippets } from "@/components/FeaturedSnippets";
import { Hero } from "@/components/Hero";
import ThemeToggle from "@/components/ThemeToggle";
import Link from "next/link";


export default function Home() {
  return (
    <div className="min-h-screen">
      <ThemeToggle />
      <Hero />
      <FeaturedSnippets />
      <Link href="/dashboard">Dashboard</Link>
    </div>
  );
}
