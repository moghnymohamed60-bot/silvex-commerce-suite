import { createFileRoute } from "@tanstack/react-router";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    question: "How long does delivery take?",
    answer:
      "Most pieces ship within 2–4 weeks. Made-to-order upholstery can take 6–8 weeks; the lead time is shown on each product page before you order.",
  },
  {
    question: "What is white-glove delivery?",
    answer:
      "A two-person team brings the piece into your home, assembles it where needed, places it in the room of your choice and removes all packaging.",
  },
  {
    question: "Can I return something?",
    answer:
      "Yes. Undamaged pieces can be returned within 30 days of delivery. Made-to-order upholstery in a custom fabric is final sale.",
  },
  {
    question: "Do you offer fabric or timber samples?",
    answer:
      "We send up to five samples free of charge. Contact us with the pieces you are considering and we will post them out.",
  },
  {
    question: "What warranty is included?",
    answer:
      "Frames and joinery are covered for ten years, and upholstery for three. We keep spare parts in stock so single components can be replaced.",
  },
  {
    question: "How should I care for solid timber?",
    answer:
      "Dust with a dry cloth, wipe spills immediately and re-oil once a year with a clear furniture oil. Keep pieces out of prolonged direct sunlight.",
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions | Silvex Furniture" },
      {
        name: "description",
        content:
          "Delivery times, white-glove service, returns, samples, warranty and care guidance for Silvex furniture.",
      },
      { property: "og:title", content: "Frequently Asked Questions | Silvex Furniture" },
      { property: "og:description", content: "Delivery, returns, warranty and care answers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <div className="container-page py-16">
      <header className="max-w-2xl">
        <p className="label-eyebrow text-muted-foreground">Help</p>
        <h1 className="display-lg mt-4">Frequently asked questions</h1>
      </header>

      <Accordion type="single" collapsible className="mt-12 max-w-3xl border-t border-border">
        {FAQS.map((item) => (
          <AccordionItem key={item.question} value={item.question}>
            <AccordionTrigger className="text-left text-base">{item.question}</AccordionTrigger>
            <AccordionContent>
              <p className="pb-2 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
