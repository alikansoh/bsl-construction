"use client";

import { FormEvent, useState } from "react";

type ServiceQuoteFormProps = {
  defaultService?: string;
  serviceName?: string;
  category?: string;
  serviceSlug: string;
};

export default function ServiceQuoteForm({
  defaultService,
  serviceName,
  category = "",
  serviceSlug,
}: ServiceQuoteFormProps) {
  const selectedService =
    defaultService ?? serviceName ?? "";

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setStatus("loading");

    const form = event.currentTarget;

    const formData = new FormData(form);

    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      postcode: formData.get("postcode"),
      projectType: formData.get("projectType"),
      message: formData.get("message"),

      // Automatically attached service information
      service: selectedService,
      category,
      serviceSlug,
    };

    try {
      const response = await fetch("/api/quote", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(
          "Failed to submit quote request"
        );
      }

      form.reset();

      setStatus("success");
    } catch (error) {
      console.error(error);

      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative rounded-[28px] bg-white p-6 shadow-[0_20px_60px_-30px_rgba(28,23,18,0.25)] ring-1 ring-[#1C1712]/[0.06] sm:p-8 lg:p-10"
    >
      {/* Hidden service information */}

      <input
        type="hidden"
        name="service"
        value={selectedService}
      />

      <input
        type="hidden"
        name="category"
        value={category}
      />

      <input
        type="hidden"
        name="serviceSlug"
        value={serviceSlug}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Name */}

        <div>
          <label
            htmlFor="name"
            className="bsl-mono mb-2 block text-[0.68rem] uppercase tracking-[0.15em] text-[#6E6259]"
          >
            Your Name *
          </label>

          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="John Smith"
            className="w-full rounded-xl border border-[#1C1712]/10 bg-[#FAF7F2] px-4 py-3.5 text-sm text-[#1C1712] outline-none transition focus:border-[#A26028] focus:ring-2 focus:ring-[#A26028]/10"
          />
        </div>

        {/* Email */}

        <div>
          <label
            htmlFor="email"
            className="bsl-mono mb-2 block text-[0.68rem] uppercase tracking-[0.15em] text-[#6E6259]"
          >
            Email Address *
          </label>

          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="john@example.com"
            className="w-full rounded-xl border border-[#1C1712]/10 bg-[#FAF7F2] px-4 py-3.5 text-sm text-[#1C1712] outline-none transition focus:border-[#A26028] focus:ring-2 focus:ring-[#A26028]/10"
          />
        </div>

        {/* Phone */}

        <div>
          <label
            htmlFor="phone"
            className="bsl-mono mb-2 block text-[0.68rem] uppercase tracking-[0.15em] text-[#6E6259]"
          >
            Phone Number
          </label>

          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+44 7..."
            className="w-full rounded-xl border border-[#1C1712]/10 bg-[#FAF7F2] px-4 py-3.5 text-sm text-[#1C1712] outline-none transition focus:border-[#A26028] focus:ring-2 focus:ring-[#A26028]/10"
          />
        </div>

        {/* Postcode */}

        <div>
          <label
            htmlFor="postcode"
            className="bsl-mono mb-2 block text-[0.68rem] uppercase tracking-[0.15em] text-[#6E6259]"
          >
            Postcode
          </label>

          <input
            id="postcode"
            name="postcode"
            type="text"
            placeholder="SW1A 1AA"
            className="w-full rounded-xl border border-[#1C1712]/10 bg-[#FAF7F2] px-4 py-3.5 text-sm text-[#1C1712] outline-none transition focus:border-[#A26028] focus:ring-2 focus:ring-[#A26028]/10"
          />
        </div>

        {/* Project Type */}

        <div className="sm:col-span-2">
          <label
            htmlFor="projectType"
            className="bsl-mono mb-2 block text-[0.68rem] uppercase tracking-[0.15em] text-[#6E6259]"
          >
            What do you need?
          </label>

          <select
            id="projectType"
            name="projectType"
            defaultValue=""
            className="w-full rounded-xl border border-[#1C1712]/10 bg-[#FAF7F2] px-4 py-3.5 text-sm text-[#1C1712] outline-none transition focus:border-[#A26028] focus:ring-2 focus:ring-[#A26028]/10"
          >
            <option
              value=""
              disabled
            >
              Select an option
            </option>

            <option value="New project">
              New project
            </option>

            <option value="Renovation">
              Renovation
            </option>

            <option value="Extension">
              Extension
            </option>

            <option value="Repair">
              Repair
            </option>

            <option value="Maintenance">
              Maintenance
            </option>

            <option value="Other">
              Other
            </option>
          </select>
        </div>

        {/* Message */}

        <div className="sm:col-span-2">
          <label
            htmlFor="message"
            className="bsl-mono mb-2 block text-[0.68rem] uppercase tracking-[0.15em] text-[#6E6259]"
          >
            Tell us about your requirements *
          </label>

          <textarea
            id="message"
            name="message"
            required
            rows={6}
            placeholder="Tell us a little about your project or requirements..."
            className="w-full resize-none rounded-xl border border-[#1C1712]/10 bg-[#FAF7F2] px-4 py-3.5 text-sm leading-7 text-[#1C1712] outline-none transition focus:border-[#A26028] focus:ring-2 focus:ring-[#A26028]/10"
          />
        </div>
      </div>

      {/* Submit */}

      <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-sm text-xs leading-5 text-[#8A8074]">
          By submitting this form, you agree that BSL Construction may contact you about your enquiry.
        </p>

        <button
          type="submit"
          disabled={status === "loading"}
          className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#A26028] px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-white transition-all hover:-translate-y-0.5 hover:bg-[#8A5121] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading"
            ? "Sending..."
            : "Request a Quote"}

          {status !== "loading" && (
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="transition-transform duration-200 group-hover:translate-x-[3px]"
            >
              <path
                d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Success */}

      {status === "success" && (
        <div className="mt-6 rounded-xl border border-green-600/20 bg-green-50 p-4 text-sm leading-6 text-green-800">
          Thank you. Your enquiry has been sent successfully. Our team will get back to you shortly.
        </div>
      )}

      {/* Error */}

      {status === "error" && (
        <div className="mt-6 rounded-xl border border-red-600/20 bg-red-50 p-4 text-sm leading-6 text-red-800">
          Something went wrong while sending your enquiry. Please try again or contact us directly.
        </div>
      )}
    </form>
  );
}