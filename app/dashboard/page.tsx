'use client'
import formatDate from "@/components/dateFormat";
import { Bookmark, Comments, Link as LinkIcon, Votes } from "@/components/Icons";
import StatsCard from "@/components/StatsCard";
import { SnippetsWithVotes, useCode } from "@/context/codeContext";
import { supabase } from "@/hooks/supabaseClient";
import { Sidebar, SidebarContainer, SidebarFooter, SidebarHeader, SidebarItem, Switch, TabContent, TabItem, TabList, Tabs } from "aspect-ui";
import { Carousel, CarouselIndicators, CarouselItem, CarouselSlides } from "aspect-ui/Carousel";
import { Typography } from "aspect-ui/Typography";
import { BarChart, Check, Code2, Copy, Star, Users } from "lucide-react";
import Link from "next/link";
import { memo, useCallback, useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

// Types
interface Languages {
  language: string;
  count: number;
}

interface Stat {
  label: string;
  value: string;
  icon: React.ReactNode;
}

// Constants
const STATS: Stat[] = [
  {
    label: 'Total Snippets',
    value: '156',
    icon: <Code2 className='absolute top-1/2 right-1 -translate-1/2 -translate-y-1/2 size-20 text-primary-900/30 dark:text-primary-100/30' />
  },
  {
    label: 'Total Views',
    value: '2.4k',
    icon: <Users className='absolute top-1/2 right-1 -translate-1/2 -translate-y-1/2 size-20 text-primary-900/30 dark:text-primary-100/30' />
  },
  {
    label: 'Favorites',
    value: '85',
    icon: <Star className='absolute top-1/2 right-1 -translate-1/2 -translate-y-1/2 size-20 text-primary-900/30 dark:text-primary-100/30' />
  },
  {
    label: 'Upvotes',
    value: '324',
    icon: <BarChart className='absolute top-1/2 right-1 -translate-1/2 -translate-y-1/2 size-20 text-primary-900/30 dark:text-primary-100/30' />
  }
];

// DashboardSnippetCard Component
export const DashboardSnippetCard = memo(function DashboardSnippetCard({ snippets, upVote }: { snippets: SnippetsWithVotes, upVote: (id: number | undefined, downVote?: boolean) => Promise<void> }) {
  const [copied, setCopied] = useState(false);
  console.log(snippets)
  console.log("snippets")

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(snippets.code ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  }, [snippets.code]);

  // const syntaxHighlighterStyle = useMemo(() => ({
  //   margin: 0,
  //   padding: '1.5rem',
  //   fontSize: '0.5rem',
  //   lineHeight: '1.5',
  //   borderRadius: '0.5rem',
  //   maxWidth: "100%",
  //   height: "200px",
  //   overflow: "hidden",
  //   userSelect: "none"
  // }), []);

  return (
    <div className="bg-primary-200/30 dark:bg-primary-950/30 rounded-xl p-6 max-w-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <Typography tagName='h3' variant="h3" className="text-primary-900 select-none">
            {snippets.title}
          </Typography>
          <Typography className="text-sm text-gray-500 mt-1 select-none">
            {formatDate(snippets.created_at ?? new Date().toISOString(), "MMM DD, YYYY")}
          </Typography>
        </div>
        <button
          onClick={handleCopy}
          className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
          title="Copy code"
        >
          {copied ? (
            <Check className="w-5 h-5 text-green-500" />
          ) : (
            <Copy className="w-5 h-5 text-gray-500" />
          )}
        </button>
      </div>

      <div className="relative">
        <div className="absolute top-1.5 right-3 text-xs font-medium text-primary-200 uppercase select-none">
          {snippets.language}
        </div>
        <div className="rounded-lg overflow-hidden">
          <SyntaxHighlighter
            language={snippets.language.toLowerCase()}
            style={coldarkDark}
            customStyle={{
              margin: 0,
              padding: '1.5rem',
              fontSize: '0.5rem',
              lineHeight: '1.5',
              borderRadius: '0.5rem',
              maxWidth: "100%",
              height: "200px",
              overflow: "hidden",
              userSelect: "none"
            }}
          >
            {snippets.code ?? ""}
          </SyntaxHighlighter>
        </div>
      </div>

      <ActionButtons snippets={snippets} upVote={upVote} />
    </div>
  );
});

// Action Buttons Component
const ActionButtons = memo(function ActionButtons({ snippets, upVote }: {
  snippets: SnippetsWithVotes;
  upVote: (id: number, downVote?: boolean) => Promise<void>;
}) {
  return (
    <div className='mt-3 flex justify-between items-center'>
      <VoteButtons snippets={snippets} upVote={upVote} />
      <CommentsButton slug={snippets.slug} />
      <BookmarkButton />
      <ShareButton />
    </div>
  )
});

const BookmarkButton = memo(function BookmarkButton() {
  return (
    <div className='inline-flex items-center group'>
      <span className='p-1 '><Bookmark className='group-hover:bg-amber-600 rounded-lg group-hover:text-amber-300 transition-colors duration-150' />
      </span>
    </div>
  )
})

const ShareButton = memo(function ShareButton() {
  return (
    <div className='inline-flex items-center group'>
      <span className='p-1 '><LinkIcon className='group-hover:bg-sky-600 rounded-lg group-hover:text-sky-300 transition-colors duration-150' />
      </span>
    </div>
  )
})

const CommentsButton = memo(function CommentsButton({ slug }: { slug: string | undefined }) {
  return (
    <div className='inline-flex items-center group'>
      <span className='p-1 '><Link href={`/code/${slug}`}> <Comments className='group-hover:bg-cyan-600 rounded-lg group-hover:text-cyan-300 transition-colors duration-150' /></Link>
      </span>
      <span className='ml-1 group-hover:text-cyan-600 transition-colors duration-150 select-none'>10</span>
    </div>
  )
})

const VoteButtons = memo(function VoteButtons({ snippets, upVote }: {
  snippets: SnippetsWithVotes;
  upVote: (id: number, downVote?: boolean) => Promise<void>;
}) {
  return (
    <div className='inline-flex bg-primary-200/70 dark:bg-primary-950/50 rounded-lg'>
      <span className={`p-1 inline-flex hover:text-emerald-400 hover:bg-emerald-600 rounded-lg ${snippets.upvote && 'text-emerald-400 bg-emerald-600'}`} onClick={() => {
        if (snippets.id) {
          upVote(snippets.id)
        }
      }}><Votes /><span className='mr-3 select-none'>{snippets.upvotes}</span></span>

      <span className={`p-1 hover:bg-red-400 rounded-lg hover:text-red-300 ${snippets.downvote && 'text-red-400 bg-red-600'}`} onClick={() => {
        if (snippets.id) {
          upVote(snippets.id, true)
        }
      }}><Votes className='rotate-180' /></span>
    </div>
  )
})

// Dashboard Page Component
const DashboardPage = () => {
  // const router = useRouter();
  const { profile, theme, toggleTheme, latestSnippets, upVote } = useCode();
  const [languages, setLanguages] = useState<Languages[]>([]);

  const fetchLanguages = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('code_code_snippets')
        .select('language')
        .eq('user_id', profile.id);

      if (error) throw error;

      const languageCounts = data.reduce<Record<string, number>>((acc, item) => {
        acc[item.language] = (acc[item.language] || 0) + 1;
        return acc;
      }, {});

      setLanguages(
        Object.entries(languageCounts).map(([language, count]) => ({
          language,
          count,
        }))
      );
    } catch (error) {
      console.error('Error fetching languages:', error);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  return (
    <div className='flex w-full h-screen relative'>
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      <Sidebar className='bg-primary-400'>
        <SidebarContent languages={languages} />
      </Sidebar>
      <DashboardMain latestSnippets={latestSnippets} upVote={upVote} />
    </div>
  );
};

const ThemeToggle = memo(function ThemeToggle({ theme, toggleTheme }: { theme: string; toggleTheme: () => void }) { return (<Switch checked={theme === 'dark'} onChange={toggleTheme} className='absolute top-4 right-4' switchIconEnabled={true} />) })

// Sidebar Content Component
const SidebarContent = memo(function SidebarContent({ languages }: { languages: Languages[] }) {
  return (
    <>
      <SidebarHeader>Dashboard</SidebarHeader>
      <SidebarContainer>
        <Typography variant='h4' className='mb-4'>Languages</Typography>
        {languages.map((language, index) => (
          <SidebarItem
            key={index}
            className='flex items-center hover:bg-primary-200 hover:text-primary-900 dark:hover:bg-primary-950 dark:hover:text-primary-100'
          >
            <Typography variant='body1'>{language.language}</Typography>
            <Typography variant='caption'>({language.count})</Typography>
          </SidebarItem>
        ))}
      </SidebarContainer>
      <SidebarFooter>footer</SidebarFooter>
    </>
  )
});

// Dashboard Main Content Component
const DashboardMain = memo(function DashboardMain({ latestSnippets, upVote }: { latestSnippets: SnippetsWithVotes[],  upVote: (id: number | undefined, downVote?: boolean) => Promise<void> }) {
  return (
    <main className='flex flex-col flex-1 px-8 pt-10 w-full'>
      <Typography variant='h2' className='mb-4'>Dashboard</Typography>
      <StatsGrid />
      <SnippetTabs latestSnippets={latestSnippets} upVote={upVote} />
    </main>
  )
});

// Stats Grid Component
const StatsGrid = memo(function StatsGrid() {
  return (
    <div className='grid grid-cols-4 gap-4 w-full mb-12 max-w-[1024px] mx-auto'>
      {STATS.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  )
});

// Snippet Tabs Component
const SnippetTabs = memo(function SnippetTabs({ latestSnippets, upVote }: { latestSnippets: SnippetsWithVotes[], upVote: (id: number | undefined, downVote?: boolean) => Promise<void> }) {
  return (
    <Tabs defaultActive='tab-1' className='w-full flex flex-col'>
      <TabList className='inline-flex items-center justify-center rounded-md bg-primary-200 p-1 mx-auto'>
        <TabItem id='tab-1' className='bg-transparent' activeClassName='!bg-primary-100'>
          Latest Snippets
        </TabItem>
        <TabItem id='tab-2' className='bg-transparent' activeClassName='!bg-primary-100'>
          Popular Snippets
        </TabItem>
        <TabItem id='tab-3' className='bg-transparent' activeClassName='!bg-primary-100'>
          Your Liked Snippets
        </TabItem>
      </TabList>
      <TabContent id='tab-1' className='max-w-full'>
        <SnippetCarousel snippets={latestSnippets} upVote={upVote} />
      </TabContent>
      <TabContent id='tab-2'>Tab 2 content</TabContent>
      <TabContent id='tab-3'>Tab 3 content</TabContent>
    </Tabs>
  )
});

// Snippet Carousel Component
const SnippetCarousel = memo(function SnippetCarousel({ snippets, upVote }: { snippets: SnippetsWithVotes[], upVote: (id: number | undefined, downVote?: boolean) => Promise<void> }) {
  if (snippets.length === 0) {
    return (<div className='flex justify-center items-center h-screen w-full fixed backdrop-blur-3xl'>

      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-100"></div>
    </div>)
  }

  return (
    <Carousel options={{}} className='max-w-[1024px] mx-auto'>
      <CarouselSlides className='w-full'>
        {snippets.map((snippet, index) => (
          <CarouselItem key={index} className='basis-1/3 grow-0 shrink-0'>
            <DashboardSnippetCard snippets={snippet} upVote={upVote} />
          </CarouselItem>
        ))}
      </CarouselSlides>
      <CarouselIndicators dotButtonStyle='border-primary-200 dark:border-primary-950' />
    </Carousel>
  );
});

export default DashboardPage;