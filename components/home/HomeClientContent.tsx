"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Star, Heart, Pencil, Gem, Truck, Gift } from "lucide-react";
import TrackedButton from "@/components/ui/TrackedButton";
import AnimatedReveal from "@/components/ui/AnimatedReveal";
import { dictionary } from "@/lib/dictionary";
import { track } from "@/lib/analytics/track";
import { supabase } from "@/lib/supabase/client";

export default function HomeClientContent() {
  const [testimonials, setTestimonials] = useState<any[]>(dictionary.testimonials.items);

  useEffect(() => {
    async function loadTestimonials() {
      try {
        const { data, error } = await supabase
          .from("Testimonial")
          .select("*")
          .order("createdAt", { ascending: true });
        if (error) throw error;
        if (data && data.length > 0) {
          setTestimonials(data);
        }
      } catch (e) {
        console.warn("Using dictionary testimonials fallback", e);
      }
    }
    loadTestimonials();
  }, []);

  return (
    <div className="space-y-16 pb-16 font-sans">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#191611] text-white">
        
        {/* MOBILE & TABLET HERO DESIGN (lg:hidden) */}
        <div className="relative w-full min-h-[90vh] flex flex-col justify-between pt-24 pb-8 px-6 lg:hidden overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="/hero-mobile-bg.png"
              alt="Afkar Al Dar cream and gold custom gift box with personalized monogram card on linen surface"
              className="w-full h-full object-cover object-top"
            />
          </div>

          <div className="relative z-10 max-w-lg space-y-4 text-left">
            <AnimatedReveal animation="fade-down" delay={100}>
              <span className="inline-block text-[9px] sm:text-[10px] font-bold tracking-[0.2em] text-[#D4BA99] uppercase bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#AD7D39]/40">
                THOUGHTFULLY CURATED. BEAUTIFULLY YOURS.
              </span>
            </AnimatedReveal>

            <AnimatedReveal animation="fade-up" delay={200}>
              <h1 className="font-serif text-[38px] sm:text-5xl font-normal tracking-tight text-white leading-[1.12]">
                Gift More Than <br />
                a Box. <br />
                <span className="font-serif italic font-light text-[#D4BA99] text-gold-gradient block mt-1">
                  Gift a Feeling.
                </span>
              </h1>
            </AnimatedReveal>

            <AnimatedReveal animation="scale-in" delay={300}>
              <Heart className="w-5 h-5 text-[#AD7D39] stroke-[1.25]" />
            </AnimatedReveal>

            <AnimatedReveal animation="fade-up" delay={400}>
              <p className="text-xs sm:text-sm text-[#D4BA99]/90 font-normal leading-relaxed max-w-xs">
                Custom luxury gift boxes, designed with love and crafted to make every moment unforgettable in Dubai & UAE.
              </p>
            </AnimatedReveal>

            <AnimatedReveal animation="fade-up" delay={500}>
              <div className="flex flex-col gap-3.5 pt-1 w-full max-w-[340px]">
                <Link href="/customize/birthday" className="w-full">
                  <TrackedButton
                    button_location="hero"
                    variant="gold"
                    size="lg"
                    eventName="start_customization"
                    className="w-full justify-center gap-3 px-6 py-4 font-bold tracking-widest text-[12px] sm:text-[13px] rounded-[18px] shadow-xl bg-[#be914d] hover:bg-[#a87e3e] text-white border-none uppercase transition-all duration-300 active:scale-[0.98]"
                  >
                    <span>DESIGN YOUR BOX NOW</span>
                    <ArrowRight className="w-4.5 h-4.5 text-white" />
                  </TrackedButton>
                </Link>

                <Link href="/occasions" className="w-full">
                  <TrackedButton
                    button_location="hero"
                    variant="outline"
                    size="lg"
                    eventName="cta_click"
                    trackingParams={{ target: "occasions" }}
                    className="w-full justify-center px-6 py-4 font-bold tracking-widest text-[12px] sm:text-[13px] rounded-[18px] border border-[#be914d]/70 bg-[#221b14]/50 backdrop-blur-md text-[#d8c09d] hover:bg-[#be914d] hover:text-white uppercase transition-all duration-300 active:scale-[0.98]"
                  >
                    <span>EXPLORE DESIGNS</span>
                  </TrackedButton>
                </Link>
              </div>
            </AnimatedReveal>

            <AnimatedReveal animation="fade-up" delay={600}>
              <div className="pt-2 flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  <img
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-[#191611] object-cover"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop"
                    alt="Satisfied client with personalized engagement gift box"
                  />
                  <img
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-[#191611] object-cover"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"
                    alt="Corporate VIP client unboxing bespoke hamper"
                  />
                  <img
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-[#191611] object-cover"
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop"
                    alt="Happy recipient of custom milestone birthday box"
                  />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[11px] font-medium text-white/90">Loved by 10,000+ happy clients</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-[#AD7D39] text-[#AD7D39]" />
                    ))}
                    <span className="text-[11px] font-bold text-[#D4BA99] ml-1">4.9/5</span>
                  </div>
                </div>
              </div>
            </AnimatedReveal>

          </div>

          <div className="relative z-10 w-full flex items-center justify-center pt-8">
            <div className="w-full flex items-center justify-center relative">
              <div className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#AD7D39]/50 to-transparent" />
              <div className="relative bg-[#191611] px-4 rounded-full border border-[#AD7D39]/30 py-0.5 shadow-md">
                <span className="font-serif text-lg font-light text-[#AD7D39]">A</span>
              </div>
            </div>
          </div>
        </div>


        {/* DESKTOP HERO DESIGN */}
        <div className="relative overflow-hidden pt-32 pb-36 hidden lg:block">
          <div className="absolute inset-0 z-0">
            <img
              src="/hero-bg.png"
              alt="Bespoke luxury wedding hamper featuring artisan dates, silk ribbon, and custom keepsake items"
              className="w-full h-full object-cover object-center transform scale-100 brightness-110 contrast-105 transition-all duration-1000 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#191611]/95 via-[#191611]/60 to-transparent max-w-4xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-row items-center justify-between gap-12">
              <div className="max-w-2xl space-y-6 text-left w-1/2">
                
                <AnimatedReveal animation="fade-down" delay={100}>
                  <span className="inline-block text-xs font-bold tracking-[0.25em] text-[#AD7D39] uppercase bg-[#AD7D39]/10 px-3 py-1 rounded-full border border-[#AD7D39]/30 animate-float">
                    {dictionary.hero.badge}
                  </span>
                </AnimatedReveal>
                
                <AnimatedReveal animation="fade-up" delay={200}>
                  <h1 className="font-serif text-5xl lg:text-6xl font-normal tracking-tight text-white leading-[1.15]">
                    {dictionary.hero.headlinePart1} <br />
                    {dictionary.hero.headlinePart2}{" "}
                    <span className="font-serif italic font-light text-[#AD7D39] text-gold-gradient">
                      {dictionary.hero.headlinePart3}
                    </span>
                  </h1>
                </AnimatedReveal>

                <AnimatedReveal animation="scale-in" delay={300}>
                  <div className="flex justify-start">
                    <Heart className="w-5 h-5 text-[#AD7D39] stroke-[1.25] animate-pulse" />
                  </div>
                </AnimatedReveal>

                <AnimatedReveal animation="fade-up" delay={400}>
                  <p className="text-base text-[#D4BA99] max-w-xl font-medium leading-relaxed">
                    {dictionary.hero.subheadline}
                  </p>
                </AnimatedReveal>

                <AnimatedReveal animation="fade-up" delay={500}>
                  <div className="flex flex-row items-center justify-start gap-4 pt-2">
                    <Link href="/customize/birthday">
                      <TrackedButton
                        button_location="hero"
                        variant="gold"
                        size="lg"
                        eventName="start_customization"
                        className="gap-2.5 px-8 py-4 font-bold tracking-wider text-xs rounded-md shadow-lg group"
                      >
                        <span>{dictionary.hero.primaryCta}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </TrackedButton>
                    </Link>

                    <Link href="/occasions">
                      <TrackedButton
                        button_location="hero"
                        variant="outline"
                        size="lg"
                        eventName="cta_click"
                        trackingParams={{ target: "occasions" }}
                        className="px-8 py-4 font-bold tracking-wider text-xs rounded-md border-[#AD7D39] text-[#D4BA99] hover:bg-[#AD7D39] hover:text-white transition-all"
                      >
                        <span>{dictionary.hero.secondaryCta}</span>
                      </TrackedButton>
                    </Link>
                  </div>
                </AnimatedReveal>

                <AnimatedReveal animation="fade-up" delay={600}>
                  <div className="pt-6 flex flex-row items-center justify-start gap-4">
                    <div className="flex -space-x-3">
                      <img
                        className="inline-block h-10 w-10 rounded-full ring-2 ring-[#191611] object-cover hover:scale-110 transition-transform duration-300"
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop"
                        alt="Customer testimonial avatar 1"
                      />
                      <img
                        className="inline-block h-10 w-10 rounded-full ring-2 ring-[#191611] object-cover hover:scale-110 transition-transform duration-300"
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"
                        alt="Customer testimonial avatar 2"
                      />
                      <img
                        className="inline-block h-10 w-10 rounded-full ring-2 ring-[#191611] object-cover hover:scale-110 transition-transform duration-300"
                        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop"
                        alt="Customer testimonial avatar 3"
                      />
                    </div>
                    <div className="text-left space-y-0.5">
                      <p className="text-xs font-bold text-white tracking-wide">{dictionary.hero.reviews}</p>
                      <div className="flex items-center justify-start gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-[#AD7D39] text-[#AD7D39]" />
                        ))}
                        <span className="text-xs font-bold text-[#D4BA99] ml-1.5">{dictionary.hero.rating}</span>
                      </div>
                    </div>
                  </div>
                </AnimatedReveal>

              </div>
            </div>
          </div>
        </div>

      </section>

      {/* 2. VALUE PROPOSITIONS STRIP */}
      <section className="relative bg-[#F6F0E7]/60 py-10 sm:py-14 overflow-hidden border-y border-[#3C2D1E]/5">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#AD7D39]/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#AD7D39]/30 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedReveal animation="fade-up" delay={100}>
            <div className="flex overflow-x-auto no-scrollbar lg:grid lg:grid-cols-5 gap-4 pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 scroll-smooth">

              {[
                { icon: <Pencil className="w-5 h-5" />, idx: 0 },
                { icon: <Gem className="w-5 h-5" />, idx: 1 },
                { icon: <Truck className="w-5 h-5" />, idx: 2 },
                { icon: <Gift className="w-5 h-5" />, idx: 3 },
                { icon: <Heart className="w-5 h-5" />, idx: 4 },
              ].map((item) => (
                <div
                  key={item.idx}
                  className="group relative bg-[#FBF8F3] rounded-2xl p-5 sm:p-6 border border-[#AD7D39]/15 hover:border-[#AD7D39]/50 transition-all duration-400 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(173,125,57,0.08)] w-[160px] sm:w-[220px] lg:w-auto shrink-0"
                >
                  <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-[#AD7D39]/60 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="text-[#AD7D39] group-hover:scale-110 transition-transform duration-300">
                      {item.icon}
                    </div>
                    <h4 className="font-serif text-[11px] sm:text-xs font-bold tracking-[0.2em] text-[#191611] group-hover:text-[#AD7D39] uppercase leading-tight transition-colors duration-300">
                      {dictionary.valueProps[item.idx].title}
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-[#625D55] leading-relaxed font-medium hidden sm:block">
                      {dictionary.valueProps[item.idx].description}
                    </p>
                  </div>
                </div>
              ))}

            </div>
          </AnimatedReveal>
        </div>
      </section>

      {/* 3. SHOP BY OCCASION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <AnimatedReveal animation="fade-up">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-wider text-[#191611]">
              {dictionary.occasions.title.split(" BY ")[0]} BY <span className="underline decoration-[#AD7D39] decoration-2 underline-offset-8">{dictionary.occasions.title.split(" BY ")[1]}</span>
            </h2>
          </div>
        </AnimatedReveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {dictionary.occasions.items.map((occ, idx) => (
            <AnimatedReveal key={occ.slug} animation="fade-up" delay={idx * 80}>
              <div className="luxury-card overflow-hidden group flex flex-col justify-between p-3 bg-white h-full">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-[#191611]">
                  <img
                    src={occ.image}
                    alt={`${occ.name} custom gift box collection Afkar Al Dar`}
                    className="object-cover w-full h-full img-zoom-hover"
                  />
                </div>

                <div className="pt-4 pb-2 text-center">
                  <h3 className="font-serif text-sm font-bold text-[#191611] tracking-wide leading-tight group-hover:text-[#AD7D39] transition-colors">
                    {occ.name}
                  </h3>
                  <Link
                    href={`/occasions/${occ.slug}`}
                    onClick={() => track("select_occasion", { occasion: occ.slug, button_location: "occasion_card" })}
                    className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold text-[#AD7D39] mt-3 hover:underline group/btn"
                  >
                    <span>VIEW DESIGNS</span>
                    <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </AnimatedReveal>
          ))}
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4 relative">
        <AnimatedReveal animation="fade-up">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-wider text-[#191611]">
              HOW <span className="underline decoration-[#AD7D39] decoration-2 underline-offset-8">IT WORKS</span>
            </h2>
            <p className="text-xs text-[#8A8378] tracking-widest uppercase font-semibold">
              Three simple steps to craft your bespoke gift box
            </p>
          </div>
        </AnimatedReveal>

        <div className="hidden lg:block absolute left-[18%] right-[18%] top-[56%] h-[2px] border-b-2 border-dashed border-[#AD7D39]/40 z-0" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 relative z-10">
          {dictionary.howItWorks.steps.map((item, idx) => (
            <AnimatedReveal key={idx} animation="scale-in" delay={idx * 150}>
              <div className="group flex flex-col items-center text-center space-y-5 p-6 rounded-2xl transition-all duration-300 hover:bg-white/90 hover:shadow-xl hover:shadow-[#AD7D39]/5 border border-transparent hover:border-[#AD7D39]/20">
                
                <div className="w-16 h-16 rounded-full bg-white border-2 border-[#AD7D39]/40 flex items-center justify-center shadow-lg shadow-[#AD7D39]/10 relative group-hover:scale-110 group-hover:border-[#AD7D39] group-hover:shadow-xl group-hover:shadow-[#AD7D39]/20 transition-all duration-300">
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-gradient-to-tr from-[#AD7D39] to-[#C89B55] text-white text-[10px] font-bold shadow-md flex items-center justify-center ring-2 ring-white animate-float">
                    {item.step}
                  </span>
                  
                  {idx === 0 && <Gift className="w-7 h-7 text-[#AD7D39] stroke-[1.5] group-hover:scale-110 transition-transform duration-300" />}
                  {idx === 1 && <Pencil className="w-7 h-7 text-[#AD7D39] stroke-[1.5] group-hover:scale-110 transition-transform duration-300" />}
                  {idx === 2 && <Truck className="w-7 h-7 text-[#AD7D39] stroke-[1.5] group-hover:scale-110 transition-transform duration-300" />}
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-sm font-bold tracking-widest text-[#191611] group-hover:text-[#AD7D39] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#625D55] leading-relaxed max-w-[220px] mx-auto font-medium">
                    {item.description}
                  </p>
                </div>

              </div>
            </AnimatedReveal>
          ))}
        </div>
      </section>

      {/* 5. CUSTOMER TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <AnimatedReveal animation="fade-up">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-wider text-[#191611]">
              WHAT OUR <span className="underline decoration-[#AD7D39] decoration-2 underline-offset-8">CUSTOMERS SAY</span>
            </h2>
          </div>
        </AnimatedReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <AnimatedReveal key={idx} animation="fade-up" delay={idx * 120}>
              <div className="luxury-card p-6 bg-white flex flex-col justify-between gap-6 border border-[#3C2D1E]/10 h-full">
                
                <div className="space-y-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#AD7D39] text-[#AD7D39]" />
                    ))}
                  </div>
                  <p className="text-xs text-[#292725] italic leading-relaxed">
                    "{t.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-[#3C2D1E]/10">
                  <img
                    src={t.avatar}
                    alt={`${t.author} profile`}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-[#AD7D39]/30 hover:scale-110 transition-transform duration-300"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#191611] block">{t.author}</span>
                    <span className="text-[9px] font-semibold text-[#8A8378] tracking-wider uppercase">
                      {t.location}
                    </span>
                  </div>
                </div>

              </div>
            </AnimatedReveal>
          ))}
        </div>
      </section>

      {/* 6. PRE-FOOTER BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedReveal animation="scale-in">
          <div className="relative rounded-3xl overflow-hidden bg-[#191611] text-white p-8 sm:p-12 lg:p-14 border-2 border-[#AD7D39]/50 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8 group">
            
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img
                src="/cta-bg.jfif"
                alt="Curator hand-wrapping a customized corporate gift box with gold foil branding"
                className="w-full h-full object-cover object-left brightness-105 contrast-105 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-[#191611]/95 via-[#191611]/85 to-transparent lg:left-[35%] hidden lg:block" />
              <div className="absolute inset-0 bg-[#191611]/75 lg:hidden" />
            </div>

            <div className="hidden lg:block lg:w-1/2" />

            <div className="relative z-10 lg:w-1/2 space-y-6 text-center lg:text-left">
              <div className="space-y-3">
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-wide text-white leading-tight">
                  Ready to Create <br className="hidden sm:inline" /> Something Beautiful?
                </h2>
                <p className="text-sm sm:text-base text-[#D4BA99] tracking-wide font-medium">
                  Design a gift box that leaves a lasting impression.
                </p>
              </div>

              <div>
                <Link href="/customize/birthday" className="inline-block w-full sm:w-auto">
                  <TrackedButton
                    button_location="bottom_cta"
                    variant="gold"
                    size="lg"
                    eventName="start_customization"
                    className="w-full sm:w-auto gap-2.5 px-8 py-4 font-bold tracking-wider text-xs rounded-xl shadow-2xl hover:scale-105 transition-all bg-gradient-to-r from-[#AD7D39] to-[#C89B55] text-white border border-[#AD7D39]/40 group/btn"
                  >
                    <span>{dictionary.hero.primaryCta}</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </TrackedButton>
                </Link>
              </div>
            </div>

          </div>
        </AnimatedReveal>
      </section>

    </div>
  );
}
