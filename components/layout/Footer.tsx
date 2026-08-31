"use client";

import Link from "next/link";
import { Phone, Mail, Clock, Gift } from "lucide-react";
import { dictionary } from "@/lib/dictionary";
import { track } from "@/lib/analytics/track";

export default function Footer() {
  return (
    <footer className="bg-[#191611] text-[#FBF8F3] pt-16 pb-12 border-t border-[#AD7D39]/20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Info */}
          <div className="space-y-5 md:col-span-1">
            <Link href="/" className="flex flex-col items-start">
              <div className="relative flex items-center justify-center">
                <span className="font-serif text-3xl font-light text-[#AD7D39] leading-none select-none">A</span>
                <div className="absolute w-5 h-5 border-b border-[#AD7D39] rotate-45 translate-x-1.5 -translate-y-0.5 opacity-70" />
              </div>
              <span className="font-serif text-xs tracking-[0.25em] font-bold text-white uppercase mt-1">
                Afkar AlDar
              </span>
              <span className="text-[6px] tracking-[0.3em] uppercase text-[#AD7D39] font-medium mt-1">
                Bespoke Luxury Gifting
              </span>
            </Link>

            <p className="text-xs text-[#8A8378] leading-relaxed max-w-xs">
              {dictionary.footer.about}
            </p>

            {/* Social Icons matching reference image */}
            <div className="flex items-center gap-4 pt-2">
              <a
                href="#"
                className="text-[#8A8378] hover:text-[#AD7D39] transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                </svg>
              </a>
              <a
                href="#"
                className="text-[#8A8378] hover:text-[#AD7D39] transition-colors"
                aria-label="Pinterest"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 4.27 2.68 7.91 6.46 9.39-.09-.8-.17-2.03.03-2.91.19-.8 1.25-5.32 1.25-5.32s-.32-.64-.32-1.59c0-1.49.86-2.6 1.94-2.6.91 0 1.35.69 1.35 1.51 0 .92-.58 2.29-.89 3.56-.25 1.07.54 1.95 1.6 1.95 1.92 0 3.4-2.02 3.4-4.94 0-2.58-1.85-4.39-4.5-4.39-3.07 0-4.87 2.3-4.87 4.68 0 .93.36 1.93.8 2.46.09.11.1.2.07.31-.08.33-.26 1.05-.3 1.2-.05.21-.17.26-.39.16-1.46-.68-2.38-2.82-2.38-4.54 0-3.7 2.69-7.1 7.75-7.1 4.07 0 7.23 2.9 7.23 6.77 0 4.04-2.55 7.3-6.09 7.3-1.19 0-2.31-.62-2.69-1.35l-.73 2.79c-.26 1.01-1 2.27-1.49 3.08C9.86 21.84 10.91 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
                </svg>
              </a>
              <a
                href="#"
                className="text-[#8A8378] hover:text-[#AD7D39] transition-colors"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.53 3.545 12 3.545 12 3.545s-7.53 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.022 0 12 0 12s0 3.978.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.858.508 9.388.508 9.388.508s7.53 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.978 24 12 24 12s0-3.978-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-sm tracking-wider font-bold text-[#D4BA99] mb-5">QUICK LINKS</h3>
            <ul className="space-y-3.5 text-xs text-[#8A8378] font-semibold">
              <li><Link href="/occasions" className="hover:text-[#D4BA99] transition-colors">Occasions</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-[#D4BA99] transition-colors">How It Works</Link></li>
              <li><Link href="/inspiration" className="hover:text-[#D4BA99] transition-colors">Inspiration</Link></li>
              <li><Link href="/about" className="hover:text-[#D4BA99] transition-colors">About Us</Link></li>
              <li><Link href="/faq" className="hover:text-[#D4BA99] transition-colors">FAQ</Link></li>
              <li><Link href="/admin" className="hover:text-[#D4BA99] transition-colors">Track Your Order</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-serif text-sm tracking-wider font-bold text-[#D4BA99] mb-5">HELP</h3>
            <ul className="space-y-3.5 text-xs text-[#8A8378] font-semibold">
              <li><Link href="/faq" className="hover:text-[#D4BA99] transition-colors">Shipping & Delivery</Link></li>
              <li><Link href="/faq" className="hover:text-[#D4BA99] transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/faq" className="hover:text-[#D4BA99] transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/faq" className="hover:text-[#D4BA99] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/faq" className="hover:text-[#D4BA99] transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Get In Touch */}
          <div className="space-y-4">
            <h3 className="font-serif text-sm tracking-wider font-bold text-[#D4BA99]">GET IN TOUCH</h3>
            
            {/* WhatsApp Block */}
            <a
              href={`https://wa.me/${dictionary.footer.whatsapp.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("whatsapp_click", { button_location: "bottom_cta" })}
              className="flex items-center gap-2 p-3 rounded-lg border border-[#25D366]/40 hover:bg-[#25D366]/5 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center text-white shrink-0">
                <Phone className="w-4 h-4 fill-current" />
              </div>
              <div className="text-left">
                <span className="text-[9px] uppercase font-bold tracking-wider text-[#8A8378] block">Chat on WhatsApp</span>
                <span className="text-xs font-bold text-white group-hover:text-[#25D366] transition-colors">
                  {dictionary.footer.whatsapp}
                </span>
              </div>
            </a>

            <div className="space-y-2 text-xs text-[#8A8378] font-semibold">
              <a href={`mailto:${dictionary.footer.email}`} className="flex items-center gap-2.5 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-[#AD7D39]" />
                <span>{dictionary.footer.email}</span>
              </a>
              <p className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#AD7D39]" />
                <span>{dictionary.footer.hours}</span>
              </p>
            </div>

            <Link href="/customize/birthday" className="block pt-1">
              <button
                type="button"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded bg-[#AD7D39] hover:bg-[#C3944D] text-[#FBF8F3] text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
              >
                <Gift className="w-4 h-4" />
                <span>ORDER NOW</span>
              </button>
            </Link>
          </div>

        </div>

        <div className="pt-8 text-center text-[10px] text-[#8A8378] font-semibold">
          <p>{dictionary.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
