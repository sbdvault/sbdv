"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

export default function TestimonialsSection() {
  const { t } = useTranslations();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);

  const testimonials = [
    {
      quoteKey: "home.testimonials.testimonial1.quote",
      authorKey: "home.testimonials.testimonial1.author",
    },
    {
      quoteKey: "home.testimonials.testimonial2.quote",
      authorKey: "home.testimonials.testimonial2.author",
    },
    {
      quoteKey: "home.testimonials.testimonial3.quote",
      authorKey: "home.testimonials.testimonial3.author",
    },
    {
      quoteKey: "home.testimonials.testimonial4.quote",
      authorKey: "home.testimonials.testimonial4.author",
    },
    {
      quoteKey: "home.testimonials.testimonial5.quote",
      authorKey: "home.testimonials.testimonial5.author",
    },
    {
      quoteKey: "home.testimonials.testimonial6.quote",
      authorKey: "home.testimonials.testimonial6.author",
    },
  ];

  // Handle responsive items per view
  useEffect(() => {
    const updateItemsPerView = () => {
      const newItemsPerView = window.innerWidth >= 768 ? 3 : 1;
      setItemsPerView(newItemsPerView);
      // Reset index if current index becomes invalid
      const newMaxIndex = Math.max(0, testimonials.length - newItemsPerView);
      if (currentIndex > newMaxIndex) {
        setCurrentIndex(newMaxIndex);
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, [currentIndex, testimonials.length]);

  const maxIndex = Math.max(0, testimonials.length - itemsPerView);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  // Get visible testimonials, handling edge cases
  const getVisibleTestimonials = () => {
    if (currentIndex + itemsPerView <= testimonials.length) {
      return testimonials.slice(currentIndex, currentIndex + itemsPerView);
    }
    // Handle wrap-around if needed
    return testimonials.slice(currentIndex);
  };

  const visibleTestimonials = getVisibleTestimonials();

  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-heading font-semibold text-charcoal mb-6">
            {t("home.testimonialsTitle")}
          </h2>
        </motion.div>

        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border border-charcoal/20 hover:border-gold shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group"
            aria-label="Previous testimonials"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-charcoal group-hover:text-gold transition-colors duration-300" />
          </button>

          <button
            onClick={goToNext}
            disabled={currentIndex >= maxIndex}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border border-charcoal/20 hover:border-gold shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group"
            aria-label="Next testimonials"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-charcoal group-hover:text-gold transition-colors duration-300" />
          </button>

          {/* Testimonials Carousel */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
              >
                {visibleTestimonials.map((testimonial, index) => (
                  <motion.div
                    key={`${currentIndex}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                    className="p-8 border border-charcoal/10 rounded-lg bg-off-white/50 hover:border-gold hover:bg-off-white transition-all duration-300 group h-full"
                  >
                    <Quote className="w-8 h-8 text-gold mb-4 group-hover:scale-110 transition-transform duration-300" />
                    <p className="text-charcoal/80 font-body text-lg mb-6 italic leading-relaxed">
                      "{t(testimonial.quoteKey)}"
                    </p>
                    <p className="text-charcoal/60 font-body text-sm font-medium">
                      — {t(testimonial.authorKey)}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-gold w-8"
                    : "bg-charcoal/20 hover:bg-charcoal/40"
                }`}
                aria-label={`Go to testimonial set ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

