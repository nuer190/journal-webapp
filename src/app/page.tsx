"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Search, BarChart3, DatabaseZap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";


export default function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const features = [
    {
      title: "Area Explorer",
      description:
        "Search journals categorized primary by research area. Filter by specific journal databases and ranks, then select any record to view detailed information.",
      icon: MapPin,
      href: "/area-explorer",
      color: "text-sky-600",
      bgColor: "bg-sky-500/10",
    },
    {
      title: "Journal Search",
      description:
        "Quickly look up journals by ISSN or title with comprehensive search filters.",
      icon: Search,
      href: "/journal-search",
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Analytics Dashboard",
      description:
        "Analyze the ABDC dataset to view distribution across other databases and examine journal counts per research area across connected sources.",
      icon: BarChart3,
      href: "/analytics",
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Journal Source Analytics",
      description:
        "Explore and compare journals across individual databases including ABDC, Scopus, Scimago, and AJG with area-specific breakdowns.",
      icon: DatabaseZap,
      href: "/journal-source",
      color: "text-rose-600",
      bgColor: "bg-rose-500/10",
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-8rem)] overflow-hidden pb-12">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary opacity-10 blur-[100px]" />
      </div>

      <div className="flex flex-col gap-16 py-12 md:py-16 relative z-10">
        {/* 1. Hero Section */}
        <motion.section 
          className="mx-auto max-w-[980px] text-center flex flex-col items-center gap-5"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <h1 className="font-heading text-4xl font-extrabold leading-tight tracking-tighter md:text-7xl text-foreground">
            Academic Journal Ranking <br />
            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              &amp; Search System
            </span>
          </h1>
          <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl font-normal leading-normal">
            A comprehensive journal application designed to search and analyze journal rankings, 
            focusing on <strong className="text-foreground font-semibold">ABDC</strong> as the primary dataset, 
            while integrating metrics from <span className="font-medium text-foreground/80">Scopus, Scimago, and AJG</span>.
          </p>
        </motion.section>

        {/* 2. Feature Cards Section */}
        <section className="space-y-10">
          <motion.div 
            className="mx-auto max-w-[620px] text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Key Features
            </h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Explore powerful tools to search, filter, and analyze journal data across datasets.
            </p>
          </motion.div>

          {/* Grid Layout Container */}
          <motion.div 
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} variants={itemVariants} className="flex">
                  <Link href={feature.href} className="group w-full">
                    <Card className={cn(
                      "h-full flex flex-col border border-border/50 bg-background/50 backdrop-blur-sm",
                      "transition-all duration-300 ease-in-out",
                      "hover:-translate-y-2 hover:shadow-xl hover:border-primary/40"
                    )}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors duration-300">
                          {feature.title}
                        </CardTitle>
                        <div className={cn("rounded-2xl p-3 transition-transform duration-300 group-hover:scale-110", feature.bgColor)}>
                          <Icon className={cn("h-7 w-7", feature.color)} />
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-col flex-grow gap-5 pt-1">
                        <p className="text-sm text-muted-foreground flex-grow leading-relaxed">
                          {feature.description}
                        </p>
                        <div className="flex items-center text-sm font-semibold text-primary/80 group-hover:text-primary transition-all">
                          <span>Get Started</span>
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </section>
      </div>

      {/* 3. Bottom Right Reference Note */}
      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="flex justify-end pt-10 border-t border-border/40 mt-10">
          <p className="text-xs text-muted-foreground italic">
            Data Source updated at 1 July 2026
          </p>
        </div>
      </div>
    </div>
  );
}