import type { ApiQuickStartStep } from "@/data/apiDocsContent";
import { getLocalizedText } from "@/data/apiDocsContent";
import CodeBlock from "@/components/common/CodeBlock";

type QuickStartProps = {
  steps: ApiQuickStartStep[];
  locale: string;
  title: string;
  description: string;
};

export default function QuickStart({
  steps,
  locale,
  title,
  description,
}: QuickStartProps) {
  return (
    <section id="quick-start" className="scroll-mt-28">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: "#e8f5e9", color: "#00695c" }}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h2 className="font-kanit text-[1.5rem] font-bold" style={{ color: "#1a3a2a" }}>
            {title}
          </h2>
          <p className="font-sarabun text-body-md text-text-secondary">
            {description}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {steps.map((step, index) => {
          const stepTitle = getLocalizedText(step.title, locale);
          const stepDescription = getLocalizedText(step.description, locale);

          return (
            <div
              key={step.id}
              className="flex flex-col rounded-2xl border border-border-default/60 bg-white p-5 shadow-level-1"
              style={{ borderTopWidth: 3, borderTopColor: "#00695c" }}
            >
              <span
                className="mb-3 flex h-10 w-10 items-center justify-center rounded-full font-kanit text-label font-bold text-white"
                style={{ backgroundColor: "#004d40" }}
              >
                {index + 1}
              </span>
              <h3 className="font-kanit text-body-lg font-bold" style={{ color: "#1a3a2a" }}>
                {stepTitle}
              </h3>
              <p className="mt-2 flex-1 font-sarabun text-body-md text-text-secondary">
                {stepDescription}
              </p>
              {step.code && (
                <div className="mt-4">
                  <CodeBlock code={step.code} label="EXAMPLE" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
