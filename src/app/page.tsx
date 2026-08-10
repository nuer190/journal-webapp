"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Search, BarChart3, DatabaseZap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState(0);

  const containerVariants: Variants = {
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
      color: "text-sky-600 dark:text-sky-400",
      bgColor: "bg-sky-500/15 dark:bg-sky-500/20",
      borderColor: "hover:border-sky-500/50",
      image: "/previews/area-explorer.png",
      // รูปสำรองกรณีที่ยังไม่ได้ใส่ไฟล์ใน public/previews/
      fallbackImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop",
    },
    {
      title: "Journal Search",
      description:
        "Quickly look up journals by ISSN or title with comprehensive search filters.",
      icon: Search,
      href: "/journal-search",
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/15 dark:bg-emerald-500/20",
      borderColor: "hover:border-emerald-500/50",
      image: "/previews/journal-search.png",
      fallbackImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop",
    },
    {
      title: "Analytics Dashboard",
      description:
        "Analyze the ABDC dataset to view distribution across other databases and examine journal counts per research area across connected sources.",
      icon: BarChart3,
      href: "/analytics",
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/15 dark:bg-amber-500/20",
      borderColor: "hover:border-amber-500/50",
      image: "/previews/analytics.png",
      fallbackImage: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=1000&auto=format&fit=crop",
    },
    {
      title: "Journal Source Analytics",
      description:
        "Explore and compare journals across individual databases including ABDC, Scopus, Scimago, and AJG with area-specific breakdowns.",
      icon: DatabaseZap,
      href: "/journal-source",
      color: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-500/15 dark:bg-rose-500/20",
      borderColor: "hover:border-rose-500/50",
      image: "/previews/journal-source.png",
      fallbackImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop",
    },
  ];

  const [imgSrc, setImgSrc] = useState<string | null>(null);

  return (
    <div className="relative min-h-[calc(100vh-8rem)] overflow-hidden pb-16">
      {/* Background Grid Pattern & Ambient Glow */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_28px]">
        <div className="absolute left-1/2 top-10 -translate-x-1/2 -z-10 h-[380px] w-[380px] md:h-[500px] md:w-[500px] rounded-full bg-primary/15 blur-[120px] pointer-events-none" />
      </div>

      <div className="flex flex-col gap-16 py-12 md:py-16 relative z-10">
        {/* 1. Hero Section */}
        <motion.section
          className="mx-auto max-w-[980px] text-center flex flex-col items-center gap-5 px-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <h1 className="font-heading text-4xl font-extrabold leading-tight tracking-tight md:text-7xl text-foreground">
            Academic Journal Ranking <br />
            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-primary/60">
              &amp; Search System
            </span>
          </h1>
          <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl font-normal leading-relaxed">
            A comprehensive journal application designed to search and analyze journal rankings,{" "}
            focusing on <strong className="text-foreground font-semibold">ABDC</strong> as the primary dataset,{" "}
            while integrating metrics from{" "}
            <span className="font-semibold text-foreground/90">Scopus, Scimago, and AJG</span>.
          </p>
        </motion.section>

        {/* 2. Feature Cards Section */}
        <section className="space-y-10 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <motion.div
            className="mx-auto max-w-[620px] text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Key Features
            </h2>
            <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
              Explore powerful tools to search, filter, and analyze journal data across datasets.
            </p>
          </motion.div>

          {/* Grid Layout Container */}
          <motion.div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} variants={itemVariants} className="flex">
                  <Link href={feature.href} className="group w-full">
                    <Card
                      className={cn(
                        "h-full flex flex-col relative overflow-hidden",
                        "bg-card/90 dark:bg-card/80 backdrop-blur-md",
                        "border border-border/80 dark:border-border/60",
                        "shadow-md hover:shadow-2xl hover:shadow-primary/5",
                        "transition-all duration-300 ease-in-out",
                        "hover:-translate-y-2 hover:bg-card",
                        feature.borderColor
                      )}
                    >
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors duration-300">
                          {feature.title}
                        </CardTitle>
                        <div
                          className={cn(
                            "rounded-2xl p-3 transition-transform duration-300 group-hover:scale-110 shrink-0",
                            feature.bgColor
                          )}
                        >
                          <Icon className={cn("h-6 w-6 md:h-7 md:w-7", feature.color)} />
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-col flex-grow gap-5 pt-1">
                        <p className="text-sm text-muted-foreground/90 flex-grow leading-relaxed">
                          {feature.description}
                        </p>
                        <div className="flex items-center text-sm font-semibold text-primary/90 group-hover:text-primary transition-all pt-2">
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

        {/* 3. System Showcase / Live Preview Section */}
        <section className="mt-8 px-4 md:px-8 max-w-7xl mx-auto w-full space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              System Interface Preview
            </h2>
            <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
              Take a closer look at how each module works before diving in.
            </p>
          </div>

          {/* Tab Selection Buttons */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              const isActive = activeTab === idx;
              return (
                <button
                  key={feature.title}
                  onClick={() => {
                    setActiveTab(idx);
                    setImgSrc(null); // Reset fallback state เมื่อเปลี่ยน Tab
                  }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                      : "bg-card/80 text-muted-foreground border-border/80 hover:bg-card hover:text-foreground hover:border-border"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{feature.title}</span>
                </button>
              );
            })}
          </div>

          {/* Display Card Details & Image Showcase */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-card/90 border border-border/80 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-md"
          >
            {/* Left: Text & Info */}
            <div className="lg:col-span-5 space-y-5">
              <div
                className={cn(
                  "inline-flex rounded-2xl p-3.5",
                  features[activeTab].bgColor
                )}
              >
                {(() => {
                  const ActiveIcon = features[activeTab].icon;
                  return (
                    <ActiveIcon
                      className={cn("h-8 w-8", features[activeTab].color)}
                    />
                  );
                })()}
              </div>

              <div>
                <h3 className="text-2xl font-bold text-foreground">
                  {features[activeTab].title}
                </h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {features[activeTab].description}
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href={features[activeTab].href}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-md"
                >
                  <span>Open {features[activeTab].title}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right: Showcase Image Preview */}
            <div className="lg:col-span-7 relative h-72 md:h-[400px] w-full overflow-hidden rounded-xl border border-border/60 bg-muted/40 shadow-inner group">
              <Image
                src={imgSrc || features[activeTab].image}
                alt={features[activeTab].title}
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                priority
                unoptimized
                onError={() => {
                  // หากหาไฟล์ใน public/previews ไม่พบ ให้สลับไปใช้รูปตัวอย่างทันที
                  setImgSrc(features[activeTab].fallbackImage);
                }}
                className="object-cover object-top hover:scale-105 transition-transform duration-500"
              />
            </div>
          </motion.div>
        </section>
      </div>

      {/* 4. Bottom Reference Note */}
      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="flex justify-end pt-10 border-t border-border/60 mt-10">
          <p className="text-xs text-muted-foreground/80 italic">
            Data Source updated at 1 July 2026
          </p>
        </div>
      </div>
    </div>
  );
}