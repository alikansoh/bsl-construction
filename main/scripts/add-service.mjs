/**
 * scripts/add-service.mjs
 * -------------------------------------------------------------------------
 * Inserts (or updates, keyed by slug) Service documents straight into
 * MongoDB — used to seed services without going through the dashboard.
 *
 * Images are intentionally left blank ("") so they can be added later in
 * the dashboard. Everything else (copy, sections, process, FAQs, SEO) is
 * filled in.
 *
 * Run:  node scripts/add-service.mjs
 * -------------------------------------------------------------------------
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import mongoose from "mongoose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ---- load MONGODB_URI from .env.local -------------------------------- */

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

/* ---- helpers ------------------------------------------------------------ */

const emptyImage = { url: "", publicId: "", alt: "" };
const ME = { categorySlug: "mechanical-electrical", categoryName: "Mechanical & Electrical" };
const COMMERCIAL = { categorySlug: "commercial", categoryName: "Commercial" };
const primaryCta = { label: "Get a free quote", href: "/contact#quote" };
const secondaryCta = { label: "Call 07378 412002", href: "tel:+447378412002" };

/** Build a section with an empty image + empty cta. */
function section(id, layout, title, ...paragraphs) {
  return {
    id,
    layout,
    title,
    content: paragraphs.map((p) => `<p>${p}</p>`).join(""),
    image: { ...emptyImage },
    cta: { label: "", href: "" },
  };
}

/* ---- the services to seed -------------------------------------------- */

const SERVICES = [
  /* ===================================================================== */
  {
    slug: "gas",
    title: "Gas",
    ...ME,
    status: "published",
    featured: false,
    displayOrder: 80,
    hero: {
      eyebrow: "Mechanical & Electrical",
      title: "Gas services in London",
      description:
        "<p>Gas appliance installation, gas pipework, safety checks and repairs &mdash; all carried out by Gas Safe registered engineers, tested, certified and logged.</p>",
      image: { ...emptyImage },
      primaryCta,
      secondaryCta,
    },
    sections: [
      section(
        "gas-installation",
        "image-right",
        "Gas appliance & pipework installation",
        "We install and connect gas boilers, cookers, hobs, fires and water heaters, and run new or upgraded gas supply pipework in copper or track pipe &mdash; correctly sized for the total appliance load with the right isolation valves and test points.",
        "Every connection is soundness-tested and a working pressure and let-by check is carried out before the appliance is commissioned and handed over."
      ),
      section(
        "gas-safety-checks",
        "image-left",
        "Gas safety checks & landlord certificates",
        "Annual gas safety inspections for homeowners, plus landlord gas safety records (CP12) covering every appliance, flue and pipework run in the property.",
        "For managed portfolios we schedule visits and send reminders so certificates never lapse, with digital copies issued the same day."
      ),
      section(
        "gas-repairs-leaks",
        "image-right",
        "Gas leaks, faults & repairs",
        "If you smell gas we'll talk you through shutting off the supply and prioritise attendance. We trace leaks, repair or replace failed pipework and fittings, and clear appliances that have been shut down as At Risk or Immediately Dangerous.",
        "Faults are diagnosed properly, quoted before work starts, and repaired with genuine parts."
      ),
    ],
    whatsIncluded: {
      title: "What's included",
      intro:
        "Every gas job is carried out by our own Gas Safe registered engineers &mdash; installed, tested, certified and logged.",
      items: [
        "Free site visit and fixed written quote",
        "Gas Safe registered engineers",
        "Boiler, cooker, hob, fire and water heater installation",
        "New and upgraded gas supply pipework, correctly sized",
        "Tightness testing and working pressure checks",
        "Appliance commissioning and safety devices",
        "Annual gas safety inspections",
        "Landlord gas safety records (CP12)",
        "Gas leak detection and repair",
        "Making safe of At Risk / Immediately Dangerous appliances",
        "Digital certificates issued same day",
        "Workmanship guarantee",
      ],
    },
    process: {
      title: "How a gas job runs",
      description:
        "<p>A clear path from first call to a tested, certified installation &mdash; with one point of contact throughout.</p>",
      steps: [
        { step: 1, title: "Call or enquiry", content: "<p>Tell us what you need &mdash; an installation, a safety check, or a suspected fault. For a gas smell we'll talk you through isolating the supply first.</p>" },
        { step: 2, title: "Site visit & quote", content: "<p>We attend, check the supply and appliances, and send a fixed written quote for any work.</p>" },
        { step: 3, title: "Works carried out", content: "<p>A Gas Safe engineer carries out the installation or repair, sizing pipework and fitting isolation and safety devices correctly.</p>" },
        { step: 4, title: "Test & certify", content: "<p>We tightness-test the system, commission the appliance, and issue the relevant certificate or gas safety record.</p>" },
        { step: 5, title: "Hand over", content: "<p>We hand over the paperwork and your workmanship guarantee, and set a reminder for the next annual check.</p>" },
      ],
    },
    gallery: [],
    faqs: [
      { question: "Are your engineers Gas Safe registered?", answer: "Yes. All gas work is carried out by Gas Safe registered engineers under supervised site management, and you can check the registration details on request." },
      { question: "Can you move my cooker or gas hob?", answer: "Yes. Relocating a gas appliance means altering the supply pipework, which we handle as part of the job, followed by a tightness test and recommissioning." },
      { question: "Do you provide landlord gas safety certificates?", answer: "Yes. We carry out landlord gas safety inspections and issue the CP12 record, with scheduled visits and reminders for managed properties." },
      { question: "I can smell gas — what should I do?", answer: "Turn off the supply at the meter, open windows, avoid switches and naked flames, and call the National Gas Emergency line on 0800 111 999. Then call us to attend and rectify." },
      { question: "Is your work guaranteed?", answer: "All completed work carries a workmanship guarantee, on top of any manufacturer warranties on appliances and parts." },
    ],
    cta: {
      title: "Need a Gas Safe engineer in London?",
      content: "Tell us what you need &mdash; installation, safety check or repair &mdash; and we'll come back with next steps, free of charge.",
      buttonLabel: "Get your free quote",
      buttonHref: "/contact#quote",
    },
    seo: {
      metaTitle: "Gas Services in London | BSL Construction",
      metaDescription:
        "Gas services across London — appliance installation, gas pipework, safety checks, landlord certificates (CP12) and leak repairs. Gas Safe registered, fixed quotes, workmanship guarantee.",
      keywords: [
        "gas engineer london",
        "gas safe engineer london",
        "gas pipework london",
        "gas appliance installation london",
        "landlord gas safety certificate london",
        "cp12 london",
        "gas leak repair london",
        "cooker installation london",
      ],
    },
  },

  /* ===================================================================== */
  {
    slug: "air-conditioning",
    title: "Air Conditioning",
    ...ME,
    status: "published",
    featured: false,
    displayOrder: 90,
    hero: {
      eyebrow: "Mechanical & Electrical",
      title: "Air conditioning installation in London",
      description:
        "<p>Design, supply and installation of air conditioning and ventilation for homes, offices, retail and server rooms &mdash; F-Gas registered, cleanly installed, and maintained.</p>",
      image: { ...emptyImage },
      primaryCta,
      secondaryCta,
    },
    sections: [
      section(
        "ac-installation",
        "image-right",
        "Split, multi-split & VRF installation",
        "We install wall-mounted, ceiling cassette, ducted and floor-standing units, from a single room split system to multi-split and VRF systems serving a whole office or property, with heat-pump models that provide efficient heating as well as cooling.",
        "Pipework, condensate, brackets and electrical connections are planned to keep runs short and tidy, with the outdoor unit sited for airflow and low noise."
      ),
      section(
        "ac-ventilation",
        "image-left",
        "Ventilation & indoor air quality",
        "Mechanical ventilation with heat recovery (MVHR), extract systems for kitchens and washrooms, and fresh-air supply for meeting rooms and server rooms &mdash; sized to the space and balanced on commissioning.",
        "We coordinate ductwork, grilles and controls with the building and ceiling layout so the system is quiet and unobtrusive."
      ),
      section(
        "ac-maintenance",
        "image-right",
        "Servicing, F-Gas & repairs",
        "Planned maintenance keeps systems efficient and compliant: filter cleaning, coil checks, refrigerant and pressure checks, condensate clearance and controls testing, with F-Gas leak checks and logging where required.",
        "We also diagnose and repair breakdowns &mdash; poor cooling, water leaks, error codes and noisy units &mdash; and re-gas or replace components as needed."
      ),
    ],
    whatsIncluded: {
      title: "What's included",
      intro:
        "Every air conditioning project is designed, installed and commissioned by our own team &mdash; F-Gas registered and fully documented.",
      items: [
        "Free site survey and fixed written quote",
        "Heat load calculation and system design",
        "Split, multi-split, ducted and VRF installation",
        "Heat-pump units for cooling and heating",
        "Refrigerant pipework, condensate and brackets",
        "Electrical connection and isolators",
        "MVHR and extract ventilation systems",
        "Controls, zoning and scheduling set-up",
        "F-Gas compliant commissioning and logging",
        "Planned maintenance visits",
        "Breakdown diagnostics and repairs",
        "Workmanship guarantee plus manufacturer warranty registration",
      ],
    },
    process: {
      title: "How an air conditioning project runs",
      description:
        "<p>A clear path from survey to a commissioned, quiet system &mdash; with one point of contact throughout.</p>",
      steps: [
        { step: 1, title: "Survey & heat load", content: "<p>We assess the space, glazing and occupancy, and calculate the cooling and heating load so units are sized correctly.</p>" },
        { step: 2, title: "Design & fixed quote", content: "<p>You get a layout showing unit types and positions, pipework routes and the outdoor unit location, with a fixed written quote.</p>" },
        { step: 3, title: "Installation", content: "<p>We install indoor and outdoor units, refrigerant pipework, condensate and electrics, protecting finishes and keeping runs tidy.</p>" },
        { step: 4, title: "Commission & balance", content: "<p>We pressure-test, evacuate and charge the system, set controls and zoning, and balance airflow before hand-over.</p>" },
        { step: 5, title: "Hand over & maintain", content: "<p>We show you the controls, hand over the paperwork and guarantee, register the warranty, and set up a maintenance schedule if you want one.</p>" },
      ],
    },
    gallery: [],
    faqs: [
      { question: "Can air conditioning heat as well as cool?", answer: "Yes. Modern heat-pump units provide efficient heating as well as cooling, and are often used as a primary or supplementary heat source." },
      { question: "How disruptive is the installation?", answer: "A single split system is usually a one to two day job. Larger multi-split or VRF systems take longer, and we plan the work around occupied spaces." },
      { question: "Do you handle F-Gas compliance?", answer: "Yes. Installation and maintenance are carried out to F-Gas regulations, with leak checks and logging where the system size requires it." },
      { question: "Can you install units in a flat or listed building?", answer: "Often yes, but outdoor unit placement and planning permission need checking first. We'll advise at the survey and can work to conditions." },
      { question: "Do you offer maintenance contracts?", answer: "Yes. We offer planned maintenance visits for homes and commercial sites to keep systems efficient, compliant and under warranty." },
    ],
    cta: {
      title: "Planning air conditioning in London?",
      content: "Tell us about the space and how it's used &mdash; we'll come back with next steps, free of charge.",
      buttonLabel: "Get your free quote",
      buttonHref: "/contact#quote",
    },
    seo: {
      metaTitle: "Air Conditioning Installation in London | BSL Construction",
      metaDescription:
        "Air conditioning across London — split, multi-split and VRF installation, MVHR and ventilation, F-Gas servicing and repairs for homes and commercial sites. Fixed quotes, workmanship guarantee.",
      keywords: [
        "air conditioning installation london",
        "air conditioning london",
        "vrf installation london",
        "split system air conditioning london",
        "office air conditioning london",
        "mvhr installation london",
        "air conditioning maintenance london",
        "f-gas engineer london",
      ],
    },
  },

  /* ===================================================================== */
  {
    slug: "electrical",
    title: "Electrical",
    ...ME,
    status: "published",
    featured: false,
    displayOrder: 100,
    hero: {
      eyebrow: "Mechanical & Electrical",
      title: "Electrical services in London",
      description:
        "<p>Rewires, consumer units, additional circuits, lighting, EV chargers, testing and fault-finding &mdash; carried out by qualified electricians and certified to BS 7671, with the Building Regulations notification handled for you.</p>",
      image: { ...emptyImage },
      primaryCta,
      secondaryCta,
    },
    sections: [
      section(
        "electrical-installation",
        "image-right",
        "Rewires, consumer units & new circuits",
        "Full and partial rewires, consumer unit (fuse board) upgrades with RCBO protection and surge protection, and new circuits for kitchens, extensions, garden rooms, showers and appliances &mdash; installed to the current wiring regulations.",
        "First-fix and second-fix electrical work is coordinated with our building programme, so the same team that builds the space wires it and there's no gap between trades."
      ),
      section(
        "lighting-power-ev",
        "image-left",
        "Lighting, power & EV charging",
        "Interior and exterior lighting design and installation, additional sockets and data points, smart controls, and outdoor power for garden offices and lighting.",
        "We install home and workplace EV chargers with the correct dedicated circuit, earthing arrangement and load management, and register the installation as required."
      ),
      section(
        "testing-eicr-faults",
        "image-right",
        "Testing, EICR & fault-finding",
        "Electrical Installation Condition Reports (EICR) for homeowners and landlords, periodic testing for commercial premises, PAT testing, and emergency lighting checks.",
        "We trace and fix intermittent faults, tripping circuits, failed sockets and lighting issues, and provide a clear report with any remedial work quoted separately."
      ),
    ],
    whatsIncluded: {
      title: "What's included",
      intro:
        "Every electrical job is carried out by our own qualified electricians &mdash; installed, tested and certified to BS 7671.",
      items: [
        "Free site visit and fixed written quote",
        "Qualified electricians, work certified to BS 7671",
        "Full and partial rewires",
        "Consumer unit upgrades with RCBO and surge protection",
        "New circuits for kitchens, extensions and appliances",
        "Interior and exterior lighting",
        "Additional sockets, data points and smart controls",
        "EV charger installation and registration",
        "EICR, periodic and PAT testing",
        "Fault-finding and remedial works",
        "Building Regulations (Part P) notification",
        "Workmanship guarantee",
      ],
    },
    process: {
      title: "How an electrical job runs",
      description:
        "<p>A clear path from first visit to a tested, certified installation &mdash; with one point of contact throughout.</p>",
      steps: [
        { step: 1, title: "Site visit & assessment", content: "<p>We look at the existing installation, discuss what you need, and check the supply and board capacity.</p>" },
        { step: 2, title: "Fixed quote", content: "<p>You get a fixed written quote and, for rewires, a clear scope of what's included and how the property will be affected.</p>" },
        { step: 3, title: "First & second fix", content: "<p>Cabling and back boxes go in, then accessories, lighting and the consumer unit, with making-good coordinated with our building team.</p>" },
        { step: 4, title: "Test & certify", content: "<p>We test the installation, issue the Electrical Installation Certificate, and notify Building Control under Part P.</p>" },
        { step: 5, title: "Hand over", content: "<p>We hand over the certificate, any EICR, and your workmanship guarantee.</p>" },
      ],
    },
    gallery: [],
    faqs: [
      { question: "Are your electricians qualified and certified?", answer: "Yes. Work is carried out by qualified electricians, certified to BS 7671 (the wiring regulations), with Building Regulations Part P notification handled for you." },
      { question: "What is an EICR and do I need one?", answer: "An Electrical Installation Condition Report assesses the safety of an existing installation. Landlords in England need one at least every five years; homeowners are advised to have one every ten." },
      { question: "Can you install an EV charger?", answer: "Yes. We install home and workplace EV chargers on a dedicated circuit with the correct protection and earthing, and register the installation as required." },
      { question: "Do I need a full rewire?", answer: "Not always. Many properties only need a consumer unit upgrade and some remedial work. We'll tell you honestly what's needed based on testing, not assumption." },
      { question: "Is your work guaranteed?", answer: "All completed work carries a workmanship guarantee and is backed by the appropriate certification." },
    ],
    cta: {
      title: "Need an electrician in London?",
      content: "Tell us what you need &mdash; installation, testing or a fault &mdash; and we'll come back with next steps, free of charge.",
      buttonLabel: "Get your free quote",
      buttonHref: "/contact#quote",
    },
    seo: {
      metaTitle: "Electrical Services in London | BSL Construction",
      metaDescription:
        "Electricians in London — rewires, consumer unit upgrades, new circuits, lighting, EV chargers, EICR testing and fault-finding. Certified to BS 7671, fixed quotes, workmanship guarantee.",
      keywords: [
        "electrician london",
        "rewire london",
        "consumer unit upgrade london",
        "eicr london",
        "ev charger installation london",
        "electrical testing london",
        "lighting installation london",
        "part p electrician london",
      ],
    },
  },

  /* ===================================================================== */
  {
    slug: "water-regulations",
    title: "Water Regulations",
    ...ME,
    status: "published",
    featured: false,
    displayOrder: 110,
    hero: {
      eyebrow: "Mechanical & Electrical",
      title: "Water regulations compliance in London",
      description:
        "<p>Advice, installation and remedial work to meet the Water Supply (Water Fittings) Regulations 1999 &mdash; backflow protection, correct fittings and materials, and the paperwork your water supplier expects.</p>",
      image: { ...emptyImage },
      primaryCta,
      secondaryCta,
    },
    sections: [
      section(
        "water-regs-assessment",
        "image-right",
        "Risk assessment & compliance advice",
        "We assess plumbing installations against the water regulations, identify the fluid category risk for each connection, and set out exactly what's needed to bring the system into compliance &mdash; from a single kitchen tap to a full commercial fit-out.",
        "You get a clear written report suitable for sharing with your water supplier, landlord or building control."
      ),
      section(
        "water-regs-backflow",
        "image-left",
        "Backflow prevention & correct fittings",
        "We install the right backflow prevention device for each risk category &mdash; double check valves, air gaps, and RPZ valves for higher-risk applications &mdash; along with compliant pipework materials, isolation, and labelling.",
        "Common works include boiling-water taps, outside taps, irrigation, commercial catering equipment, dosing systems and dental or medical installations."
      ),
      section(
        "water-regs-remedial",
        "image-right",
        "Remedial works & notification",
        "Where an installation fails an inspection or a water supplier audit, we carry out the remedial work, retest, and provide the certification needed to close the notice.",
        "For new installations that require it, we handle the advance notification to the water supplier so the work is signed off cleanly."
      ),
    ],
    whatsIncluded: {
      title: "What's included",
      intro:
        "Every water regulations job is assessed and carried out by our own plumbers &mdash; installed, tested and documented.",
      items: [
        "Free site visit and fixed written quote",
        "Water regulations risk assessment",
        "Fluid category classification of each connection",
        "Written compliance report",
        "Backflow prevention device selection and installation",
        "Double check valves, air gaps and RPZ valves",
        "Compliant pipework materials and isolation",
        "Correct labelling and identification",
        "Remedial works to close inspection notices",
        "Advance notification to the water supplier where required",
        "Test certificates on completion",
        "Workmanship guarantee",
      ],
    },
    process: {
      title: "How a water regulations job runs",
      description:
        "<p>A clear path from assessment to a compliant, documented installation &mdash; with one point of contact throughout.</p>",
      steps: [
        { step: 1, title: "Assessment", content: "<p>We survey the installation, classify the risk at each connection, and identify anything that doesn't meet the regulations.</p>" },
        { step: 2, title: "Report & fixed quote", content: "<p>You get a written compliance report and a fixed quote for any protection devices or remedial work needed.</p>" },
        { step: 3, title: "Installation", content: "<p>We fit the correct backflow devices, materials and labelling, and notify the water supplier in advance where the work requires it.</p>" },
        { step: 4, title: "Test & certify", content: "<p>We commission and test the installation, including RPZ valve commissioning where fitted, and issue certificates.</p>" },
        { step: 5, title: "Hand over", content: "<p>We hand over the certification and report, and set a reminder for any annual testing that applies.</p>" },
      ],
    },
    gallery: [],
    faqs: [
      { question: "Who has to comply with the water regulations?", answer: "Anyone who owns or operates a plumbing system connected to the public water supply. Water suppliers can inspect installations and require remedial work where they don't comply." },
      { question: "What is a fluid category?", answer: "It's a rating from 1 (wholesome water) to 5 (serious health hazard) that describes the contamination risk of a connection. The category determines which backflow protection is required." },
      { question: "Do I need to notify my water supplier?", answer: "Certain installations must be notified to the water supplier before work starts. We identify whether yours does and handle the notification for you." },
      { question: "My installation failed a water company audit — can you help?", answer: "Yes. We carry out the remedial work, retest, and provide the certification needed to close the notice." },
      { question: "Is your work guaranteed?", answer: "All completed work carries a workmanship guarantee and is backed by the relevant test certificates." },
    ],
    cta: {
      title: "Need water regulations compliance in London?",
      content: "Tell us about the installation and we'll come back with next steps &mdash; free of charge.",
      buttonLabel: "Get your free quote",
      buttonHref: "/contact#quote",
    },
    seo: {
      metaTitle: "Water Regulations Compliance in London | BSL Construction",
      metaDescription:
        "Water regulations compliance across London — risk assessments, backflow prevention, correct fittings, remedial works and water supplier notification. Fixed quotes, test certificates, workmanship guarantee.",
      keywords: [
        "water regulations london",
        "water fittings regulations 1999",
        "backflow prevention london",
        "fluid category assessment london",
        "water regs remedial works london",
        "water supplier notification london",
        "commercial plumbing compliance london",
        "double check valve installation london",
      ],
    },
  },

  /* ===================================================================== */
  {
    slug: "rpz-testing",
    title: "RPZ Testing",
    ...ME,
    status: "published",
    featured: false,
    displayOrder: 120,
    hero: {
      eyebrow: "Mechanical & Electrical",
      title: "RPZ valve testing & installation in London",
      description:
        "<p>Installation, commissioning and annual testing of RPZ (reduced pressure zone) backflow prevention valves &mdash; carried out by an accredited tester, with certificates and reminders so compliance never lapses.</p>",
      image: { ...emptyImage },
      primaryCta,
      secondaryCta,
    },
    sections: [
      section(
        "rpz-annual-testing",
        "image-right",
        "Annual RPZ valve testing",
        "RPZ valves must be tested at least every 12 months by an accredited tester. We carry out the full test on the relief valve and both check valves, record the results, and issue a certificate for your records and your water supplier.",
        "Where a valve fails, we quote the repair or replacement, carry it out, and retest so you leave the visit compliant."
      ),
      section(
        "rpz-installation",
        "image-left",
        "RPZ installation & commissioning",
        "For fluid category 4 risks &mdash; commercial catering, irrigation, dosing systems, certain heating top-ups and industrial processes &mdash; we specify and install the correctly sized RPZ valve assembly with the required strainer, isolation, test cocks and tundish discharge.",
        "The installation is commissioned, tested and notified to the water supplier where required."
      ),
      section(
        "rpz-servicing-portfolios",
        "image-right",
        "Servicing, repairs & managed portfolios",
        "We service and repair RPZ valves of all common makes, holding spares for the frequently used models to keep downtime short.",
        "For property managers with multiple valves across a portfolio, we schedule testing, track renewal dates, and send reminders and consolidated certificates."
      ),
    ],
    whatsIncluded: {
      title: "What's included",
      intro:
        "Every RPZ job is carried out by an accredited tester &mdash; installed or tested, documented and diarised.",
      items: [
        "Free enquiry and fixed written quote",
        "Accredited RPZ valve testing",
        "Full test of relief valve and check valves",
        "Test certificate for your records and water supplier",
        "Repair or replacement of failed valves, then retest",
        "Correctly sized RPZ assembly installation",
        "Strainer, isolation, test cocks and tundish discharge",
        "Commissioning and water supplier notification where required",
        "Servicing and spares for common valve makes",
        "Portfolio scheduling and renewal tracking",
        "Reminders before the next test is due",
        "Workmanship guarantee",
      ],
    },
    process: {
      title: "How RPZ testing works",
      description:
        "<p>A clear path to a tested, certified valve &mdash; and a diarised reminder for next year.</p>",
      steps: [
        { step: 1, title: "Book the test", content: "<p>Tell us the valve make, size and location. For portfolios, send the list and we'll schedule the lot.</p>" },
        { step: 2, title: "On-site test", content: "<p>An accredited tester isolates the valve, tests the relief and check valves, and records the readings.</p>" },
        { step: 3, title: "Repair if needed", content: "<p>If the valve fails, we quote and carry out the repair or replacement using genuine parts, then retest.</p>" },
        { step: 4, title: "Certificate issued", content: "<p>You get a pass certificate for your records and to satisfy your water supplier.</p>" },
        { step: 5, title: "Reminder set", content: "<p>We diarise the next test date and send a reminder before it falls due.</p>" },
      ],
    },
    gallery: [],
    faqs: [
      { question: "How often does an RPZ valve need testing?", answer: "At least once every 12 months, by an accredited tester, and again after any repair, replacement or relocation." },
      { question: "What happens if my RPZ valve fails the test?", answer: "We quote the repair or replacement, carry it out with genuine parts, and retest so you leave the visit with a valid certificate." },
      { question: "Do you install RPZ valves as well as test them?", answer: "Yes. We specify, size and install complete RPZ assemblies for fluid category 4 risks, including commissioning and water supplier notification." },
      { question: "Can you manage testing across multiple sites?", answer: "Yes. For property managers we schedule testing across a portfolio, track renewal dates, and send reminders and consolidated certificates." },
      { question: "Why does an RPZ valve discharge water?", answer: "A small discharge under fault or backpressure conditions is normal — it's the valve protecting the mains. Continuous discharge means it needs testing or servicing, which we can attend to." },
    ],
    cta: {
      title: "Need an RPZ valve tested or installed in London?",
      content: "Send us the valve details or your site list and we'll come back with next steps &mdash; free of charge.",
      buttonLabel: "Get your free quote",
      buttonHref: "/contact#quote",
    },
    seo: {
      metaTitle: "RPZ Valve Testing & Installation in London | BSL Construction",
      metaDescription:
        "RPZ valve testing and installation across London — accredited annual testing, repairs, replacements, new RPZ assemblies and portfolio scheduling. Certificates issued, reminders set, workmanship guarantee.",
      keywords: [
        "rpz testing london",
        "rpz valve testing london",
        "rpz valve installation london",
        "accredited rpz tester london",
        "backflow prevention testing london",
        "annual rpz test london",
        "reduced pressure zone valve london",
        "commercial water compliance london",
      ],
    },
  },

  /* ===================================================================== */
  {
    slug: "hotel-maintenance",
    title: "Hotel Maintenance",
    ...COMMERCIAL,
    status: "published",
    featured: false,
    displayOrder: 130,
    hero: {
      eyebrow: "Commercial",
      title: "Hotel maintenance in London",
      description:
        "<p>Building, mechanical and electrical maintenance for hotels and serviced accommodation &mdash; guest-room repairs, plant and MEP upkeep, compliance and refurbishment works, all from one accountable team that works around occupancy.</p>",
      image: { ...emptyImage },
      primaryCta,
      secondaryCta,
    },
    sections: [
      section(
        "hotel-guest-areas",
        "image-right",
        "Guest rooms & front-of-house",
        "Fast turnaround on the things guests notice: leaking taps and showers, blocked wastes, faulty lighting and sockets, air conditioning and heating faults, damaged doors and locks, tiling, decoration and joinery.",
        "We work discreetly around checkouts and housekeeping, keeping rooms out of service for the shortest possible time and leaving them ready to sell."
      ),
      section(
        "hotel-plant-mep",
        "image-left",
        "Plant rooms, MEP & compliance",
        "Planned and reactive upkeep of boilers, calorifiers, pumps, AHUs, air conditioning, distribution boards, emergency lighting and water systems, plus support with statutory compliance &mdash; gas safety, water hygiene, RPZ testing, EICRs and PAT.",
        "We keep asset registers and certification in order so audits and brand standard inspections are straightforward."
      ),
      section(
        "hotel-refurb-projects",
        "image-right",
        "Refurbishment & project works",
        "Rolling room refurbishments, bathroom replacements, corridor and lobby upgrades, kitchen and back-of-house alterations and small extensions &mdash; phased floor by floor to protect trading.",
        "One programme covers building, plumbing, electrics and finishes, with a single point of contact from quote to handover."
      ),
    ],
    whatsIncluded: {
      title: "What's included",
      intro:
        "Hotel maintenance from a single team &mdash; reactive callouts, planned upkeep and project works under one contract.",
      items: [
        "Named account contact and agreed response times",
        "Reactive callouts for guest rooms and public areas",
        "Planned preventative maintenance schedules",
        "Boiler, AC, ventilation and plant upkeep",
        "Electrical repairs, emergency lighting and testing",
        "Plumbing, drainage and water hygiene support",
        "Statutory compliance: gas, water, EICR, PAT, RPZ",
        "Decoration, tiling, joinery and door / lock repairs",
        "Rolling room and bathroom refurbishments",
        "Out-of-hours and phased working around occupancy",
        "Asset registers and certification tracking",
        "Workmanship guarantee on completed works",
      ],
    },
    process: {
      title: "How hotel maintenance works",
      description:
        "<p>A clear structure from first survey to ongoing service &mdash; with one point of contact and reporting you can take to an audit.</p>",
      steps: [
        { step: 1, title: "Property survey", content: "<p>We walk the hotel, review assets and compliance status, and agree priorities and response times.</p>" },
        { step: 2, title: "Service proposal", content: "<p>You get a proposal covering reactive cover, a planned maintenance schedule and any immediate remedial works, with clear pricing.</p>" },
        { step: 3, title: "Mobilisation", content: "<p>We set up reporting, access arrangements and the PPM calendar, and issue the account contact details to your team.</p>" },
        { step: 4, title: "Delivery", content: "<p>Reactive jobs are logged, prioritised and closed out; planned tasks run to schedule; larger works are quoted and phased around occupancy.</p>" },
        { step: 5, title: "Reporting & review", content: "<p>You get job and compliance reporting, and a periodic review to adjust the schedule and plan capital works.</p>" },
      ],
    },
    gallery: [],
    faqs: [
      { question: "Do you work around guest occupancy?", answer: "Yes. We plan works around checkouts, housekeeping and events, work out of hours where needed, and keep rooms out of service for the shortest possible time." },
      { question: "Can you help with brand standard and audit compliance?", answer: "Yes. We maintain asset registers and certification for gas, water hygiene, electrical (EICR), PAT and RPZ testing, so audits and brand inspections are straightforward." },
      { question: "Do you cover both reactive callouts and planned maintenance?", answer: "Yes. A single contract can cover reactive cover with agreed response times, a planned preventative maintenance schedule, and project works." },
      { question: "Can one team really cover building, plumbing and electrical?", answer: "Yes — that's the point of BSL. Building, mechanical, electrical and finishing trades are all in-house, so nothing gets passed between contractors." },
      { question: "Is completed work guaranteed?", answer: "Yes. All completed works carry a workmanship guarantee, on top of any manufacturer warranties on parts." },
    ],
    cta: {
      title: "Running a hotel in London?",
      content: "Tell us about the property and what you need covered &mdash; we'll come back with a proposal, free of charge.",
      buttonLabel: "Get your free quote",
      buttonHref: "/contact#quote",
    },
    seo: {
      metaTitle: "Hotel Maintenance in London | BSL Construction",
      metaDescription:
        "Hotel maintenance across London — reactive guest-room repairs, planned MEP and plant upkeep, statutory compliance and phased refurbishments from one accountable team. Works around occupancy.",
      keywords: [
        "hotel maintenance london",
        "hotel maintenance company london",
        "hotel mep maintenance london",
        "hotel refurbishment london",
        "hospitality maintenance london",
        "guest room repairs london",
        "hotel compliance maintenance london",
        "serviced accommodation maintenance london",
      ],
    },
  },

  /* ===================================================================== */
  {
    slug: "commercial-maintenance",
    title: "Commercial Maintenance",
    ...COMMERCIAL,
    status: "published",
    featured: false,
    displayOrder: 140,
    hero: {
      eyebrow: "Commercial",
      title: "Commercial building maintenance in London",
      description:
        "<p>Building, mechanical and electrical maintenance for offices, retail, industrial units and managed properties &mdash; one contract, one contact, and every trade in-house.</p>",
      image: { ...emptyImage },
      primaryCta,
      secondaryCta,
    },
    sections: [
      section(
        "commercial-fabric",
        "image-right",
        "Building fabric & fit-out upkeep",
        "Doors, ironmongery and access control, ceilings and partitions, flooring, decoration, glazing, roofing and gutters, washroom and kitchen repairs &mdash; keeping premises presentable, safe and lettable.",
        "We handle dilapidations, make-good works and small alterations as tenants move in and out."
      ),
      section(
        "commercial-mep",
        "image-left",
        "Mechanical & electrical services",
        "Heating, hot water, air conditioning and ventilation upkeep; distribution boards, lighting, emergency lighting and small power; plumbing and drainage; and the statutory testing that goes with them &mdash; EICR, PAT, gas safety, water hygiene and RPZ.",
        "Planned maintenance keeps plant reliable; reactive cover deals with the breakdowns."
      ),
      section(
        "commercial-contracts",
        "image-right",
        "Contracts, reporting & project works",
        "Flexible arrangements from pay-as-you-go callouts to full planned maintenance contracts, with a named account contact, agreed response times and clear job reporting.",
        "When something bigger is needed &mdash; a refurbishment, a reconfiguration, an extension &mdash; the same team quotes and delivers it."
      ),
    ],
    whatsIncluded: {
      title: "What's included",
      intro:
        "Commercial maintenance from a single team &mdash; reactive, planned and project works under one contract.",
      items: [
        "Named account contact and agreed response times",
        "Reactive callouts across all trades",
        "Planned preventative maintenance schedules",
        "Heating, AC, ventilation and plant upkeep",
        "Electrical repairs, emergency lighting and testing",
        "Plumbing, drainage and washroom maintenance",
        "Building fabric, doors, flooring and decoration",
        "Statutory compliance: EICR, PAT, gas, water, RPZ",
        "Dilapidations and make-good works",
        "Refurbishment and alteration project works",
        "Job and compliance reporting",
        "Workmanship guarantee on completed works",
      ],
    },
    process: {
      title: "How commercial maintenance works",
      description:
        "<p>A clear structure from survey to ongoing service &mdash; with one point of contact and reporting you can rely on.</p>",
      steps: [
        { step: 1, title: "Site survey", content: "<p>We survey the premises, review plant and compliance status, and agree priorities and response times.</p>" },
        { step: 2, title: "Proposal", content: "<p>You get a proposal covering reactive cover, a planned maintenance schedule and any immediate remedial works, with clear pricing.</p>" },
        { step: 3, title: "Mobilisation", content: "<p>We set up reporting, access and the PPM calendar, and issue account contact details to your team.</p>" },
        { step: 4, title: "Delivery", content: "<p>Reactive jobs are logged, prioritised and closed out; planned tasks run to schedule; larger works are quoted and programmed.</p>" },
        { step: 5, title: "Reporting & review", content: "<p>You get job and compliance reporting and a periodic review to adjust the schedule and plan capital works.</p>" },
      ],
    },
    gallery: [],
    faqs: [
      { question: "What types of premises do you cover?", answer: "Offices, retail units, industrial and warehouse space, mixed-use and managed properties across London." },
      { question: "Do I need a contract or can I call ad hoc?", answer: "Both work. We offer pay-as-you-go callouts as well as planned maintenance contracts with agreed response times and reporting." },
      { question: "Can you handle statutory compliance testing?", answer: "Yes. EICR, PAT, gas safety, water hygiene and RPZ testing can all be included, with certification tracked and renewed on time." },
      { question: "Can the same team do a refurbishment later?", answer: "Yes. Building, mechanical and electrical trades are in-house, so refurbishments, reconfigurations and extensions stay with one accountable team." },
      { question: "Is completed work guaranteed?", answer: "Yes. All completed works carry a workmanship guarantee, on top of any manufacturer warranties on parts." },
    ],
    cta: {
      title: "Managing a commercial property in London?",
      content: "Tell us about the premises and what you need covered &mdash; we'll come back with a proposal, free of charge.",
      buttonLabel: "Get your free quote",
      buttonHref: "/contact#quote",
    },
    seo: {
      metaTitle: "Commercial Building Maintenance in London | BSL Construction",
      metaDescription:
        "Commercial maintenance across London — reactive callouts, planned preventative maintenance, MEP and building fabric upkeep, statutory compliance and project works from one in-house team.",
      keywords: [
        "commercial maintenance london",
        "commercial building maintenance london",
        "office maintenance london",
        "retail maintenance london",
        "planned maintenance contract london",
        "mep maintenance london",
        "property maintenance company london",
        "facilities maintenance london",
      ],
    },
  },

  /* ===================================================================== */
  {
    slug: "planned-maintenance",
    title: "Planned Maintenance",
    ...COMMERCIAL,
    status: "published",
    featured: false,
    displayOrder: 150,
    hero: {
      eyebrow: "Commercial",
      title: "Planned preventative maintenance in London",
      description:
        "<p>Scheduled inspection, servicing and testing that keeps buildings compliant and plant reliable &mdash; a clear PPM calendar, asset register and reporting, delivered by one in-house team.</p>",
      image: { ...emptyImage },
      primaryCta,
      secondaryCta,
    },
    sections: [
      section(
        "ppm-asset-schedule",
        "image-right",
        "Asset register & PPM schedule",
        "We survey and list the assets that need attention &mdash; boilers, AHUs, AC units, pumps, distribution boards, emergency lighting, water systems, fire dampers, roofs and gutters &mdash; and build a task calendar with the right frequency for each.",
        "You get a single view of what's due when, so nothing slips and budgets are predictable."
      ),
      section(
        "ppm-servicing-testing",
        "image-left",
        "Servicing & statutory testing",
        "Routine servicing of mechanical and electrical plant, plus the statutory testing that keeps a building legal: gas safety, fixed wire (EICR), PAT, emergency lighting, water hygiene / Legionella and RPZ valve testing.",
        "Certificates are issued promptly and stored against the asset so audits are quick."
      ),
      section(
        "ppm-reporting-remedials",
        "image-right",
        "Reporting, remedials & lifecycle planning",
        "After each visit you get a report with findings, photos and recommendations. Minor remedials are done on the spot where possible; larger works are quoted clearly.",
        "We also flag assets approaching end of life so capital replacement can be planned rather than reacted to."
      ),
    ],
    whatsIncluded: {
      title: "What's included",
      intro:
        "A structured PPM programme delivered and reported by one team &mdash; so compliance and reliability are managed, not chased.",
      items: [
        "Asset survey and register",
        "Tailored PPM task calendar with correct frequencies",
        "Mechanical plant servicing",
        "Electrical fixed wire testing (EICR) and PAT",
        "Gas safety inspections",
        "Emergency lighting testing",
        "Water hygiene / Legionella monitoring support",
        "RPZ valve testing",
        "Fire damper and AOV checks where applicable",
        "Post-visit reports with photos and recommendations",
        "Certification stored against each asset",
        "Lifecycle and capital replacement planning",
      ],
    },
    process: {
      title: "How planned maintenance works",
      description:
        "<p>A clear structure from asset survey to year-round delivery &mdash; with reporting you can take to an audit.</p>",
      steps: [
        { step: 1, title: "Asset survey", content: "<p>We identify and list every asset and compliance item that needs scheduled attention.</p>" },
        { step: 2, title: "Build the schedule", content: "<p>We set the right task and frequency for each asset and produce a 12-month PPM calendar with clear pricing.</p>" },
        { step: 3, title: "Deliver the visits", content: "<p>Our engineers carry out servicing and statutory testing to schedule, minimising disruption to occupiers.</p>" },
        { step: 4, title: "Report & remediate", content: "<p>You get a report after each visit; minor issues are fixed on the day, larger ones quoted.</p>" },
        { step: 5, title: "Review & plan", content: "<p>A periodic review keeps the schedule right and turns end-of-life findings into a planned capital programme.</p>" },
      ],
    },
    gallery: [],
    faqs: [
      { question: "What's the difference between planned and reactive maintenance?", answer: "Planned maintenance is scheduled servicing and testing to prevent failures and keep a building compliant. Reactive maintenance responds to breakdowns after they happen. Most properties need both." },
      { question: "Which statutory tests can you include?", answer: "Gas safety, fixed wire (EICR), PAT, emergency lighting, water hygiene / Legionella and RPZ valve testing, with certificates stored against each asset." },
      { question: "Do you provide an asset register?", answer: "Yes. We survey the building and produce an asset register, then build the PPM schedule around it." },
      { question: "How are extra works handled?", answer: "Minor remedials found during a visit are done on the spot where possible; anything larger is reported with photos and quoted separately before proceeding." },
      { question: "Can you plan for equipment replacement?", answer: "Yes. We flag assets approaching end of life so replacement can be budgeted and planned rather than dealt with as an emergency." },
    ],
    cta: {
      title: "Need a PPM programme in London?",
      content: "Tell us about the building and its plant &mdash; we'll come back with a schedule and proposal, free of charge.",
      buttonLabel: "Get your free quote",
      buttonHref: "/contact#quote",
    },
    seo: {
      metaTitle: "Planned Preventative Maintenance in London | BSL Construction",
      metaDescription:
        "Planned preventative maintenance (PPM) across London — asset registers, tailored service schedules, statutory testing, post-visit reporting and lifecycle planning from one in-house team.",
      keywords: [
        "planned preventative maintenance london",
        "ppm london",
        "planned maintenance contract london",
        "statutory compliance testing london",
        "asset register london",
        "building services maintenance london",
        "mechanical and electrical ppm london",
        "commercial ppm provider london",
      ],
    },
  },

  /* ===================================================================== */
  {
    slug: "reactive-maintenance",
    title: "Reactive Maintenance",
    ...COMMERCIAL,
    status: "published",
    featured: false,
    displayOrder: 160,
    hero: {
      eyebrow: "Commercial",
      title: "Reactive maintenance & callouts in London",
      description:
        "<p>When something breaks, one call gets it fixed &mdash; building, plumbing, electrical, heating and drainage callouts with agreed response times and every trade in-house.</p>",
      image: { ...emptyImage },
      primaryCta,
      secondaryCta,
    },
    sections: [
      section(
        "reactive-response",
        "image-right",
        "Fast response across every trade",
        "Leaks and drainage blockages, no heating or hot water, power and lighting faults, failed door closers and locks, roof leaks, damaged flooring and glazing &mdash; logged, prioritised and attended within agreed timeframes.",
        "Because building, mechanical and electrical trades are all in-house, one attendance usually covers it rather than a chain of subcontractors."
      ),
      section(
        "reactive-outofhours",
        "image-left",
        "Out-of-hours & emergency cover",
        "For urgent issues that can't wait &mdash; escaping water, loss of power, security-critical door failures &mdash; we provide out-of-hours attendance to make safe and stabilise, then return to complete the permanent repair.",
        "You get a direct number and a clear escalation path, not a call centre."
      ),
      section(
        "reactive-reporting",
        "image-right",
        "Transparent quoting & reporting",
        "Each job is logged with a reference, attended, and closed out with notes and photos. Where a repair needs parts or a return visit, you get a clear quote before we proceed.",
        "Recurring faults are flagged so they can be designed out or moved onto a planned schedule."
      ),
    ],
    whatsIncluded: {
      title: "What's included",
      intro:
        "Reactive cover from one team &mdash; logged, prioritised, attended and reported.",
      items: [
        "Single number for all trades",
        "Agreed response times by priority",
        "Plumbing and drainage callouts",
        "Heating and hot water breakdowns",
        "Electrical, lighting and emergency lighting faults",
        "Doors, locks, access control and glazing repairs",
        "Roof leaks and building fabric repairs",
        "Out-of-hours make-safe attendance",
        "Job references, notes and photos on close-out",
        "Clear quotes for parts and return visits",
        "Recurring-fault flagging",
        "Workmanship guarantee on completed repairs",
      ],
    },
    process: {
      title: "How reactive maintenance works",
      description:
        "<p>A simple loop: report, prioritise, attend, close out &mdash; with clear communication at each step.</p>",
      steps: [
        { step: 1, title: "Report the fault", content: "<p>Call or email the fault. We log it with a reference and give it a priority based on impact.</p>" },
        { step: 2, title: "Attend", content: "<p>An engineer attends within the agreed timeframe, diagnoses the fault and makes safe where needed.</p>" },
        { step: 3, title: "Fix or quote", content: "<p>Straightforward repairs are completed on the visit. If parts or a return visit are needed, you get a clear quote first.</p>" },
        { step: 4, title: "Close out", content: "<p>The job is closed with notes and photos, and any follow-on work is scheduled.</p>" },
        { step: 5, title: "Review recurring issues", content: "<p>We flag repeat faults so they can be designed out or moved onto a planned maintenance schedule.</p>" },
      ],
    },
    gallery: [],
    faqs: [
      { question: "How quickly do you respond?", answer: "Response times are agreed up front by priority — for example a same-day attendance for escaping water or loss of power, and a scheduled slot for non-urgent repairs." },
      { question: "Do you offer out-of-hours cover?", answer: "Yes. For urgent issues we attend out of hours to make safe and stabilise, then return to complete the permanent repair." },
      { question: "Do I need a contract for reactive callouts?", answer: "No. Reactive maintenance can be pay-as-you-go, though a contract gives you agreed response times and a direct escalation path." },
      { question: "Will one visit fix it, or several?", answer: "Because every trade is in-house, most jobs are resolved in one attendance. Where parts are needed we quote before ordering and book the return visit." },
      { question: "Are repairs guaranteed?", answer: "Yes. Completed repairs carry a workmanship guarantee, on top of any manufacturer warranties on parts." },
    ],
    cta: {
      title: "Something broken in your building?",
      content: "Call us or send the details &mdash; we'll log it, attend and close it out.",
      buttonLabel: "Get your free quote",
      buttonHref: "/contact#quote",
    },
    seo: {
      metaTitle: "Reactive Maintenance & Callouts in London | BSL Construction",
      metaDescription:
        "Reactive maintenance across London — one number for plumbing, electrical, heating, drainage and building fabric callouts, with agreed response times, out-of-hours cover and clear reporting.",
      keywords: [
        "reactive maintenance london",
        "commercial callout london",
        "emergency maintenance london",
        "out of hours maintenance london",
        "property callout service london",
        "building repairs london",
        "reactive repairs contractor london",
        "facilities callout london",
      ],
    },
  },

  /* ===================================================================== */
  {
    slug: "facilities-support",
    title: "Facilities Support",
    ...COMMERCIAL,
    status: "published",
    featured: false,
    displayOrder: 170,
    hero: {
      eyebrow: "Commercial",
      title: "Facilities support in London",
      description:
        "<p>Hard-FM support for facilities and property teams &mdash; a single trade partner for maintenance, compliance, minor works and fit-out changes, with reporting that fits how you already work.</p>",
      image: { ...emptyImage },
      primaryCta,
      secondaryCta,
    },
    sections: [
      section(
        "fm-single-partner",
        "image-right",
        "One trade partner for hard FM",
        "Rather than managing separate plumbers, electricians, builders and HVAC contractors, your FM team gets one accountable partner covering building fabric and MEP &mdash; reactive, planned and small projects.",
        "That means fewer suppliers to manage, one set of paperwork, and one contact who knows the estate."
      ),
      section(
        "fm-compliance-support",
        "image-left",
        "Compliance & documentation support",
        "We deliver and evidence statutory testing &mdash; EICR, PAT, gas, emergency lighting, water hygiene, RPZ &mdash; and provide certification and remedial tracking in a format your compliance system can absorb.",
        "For audits and mobilisations we can produce asset data and O&M-style records for the areas we cover."
      ),
      section(
        "fm-minor-works-fitout",
        "image-right",
        "Minor works, churn & fit-out changes",
        "Desk moves and power / data changes, partitioning and ceiling alterations, meeting-room and kitchen upgrades, decoration, flooring and signage &mdash; the constant churn of an occupied building.",
        "Each job is scoped, quoted and delivered around the working day, with make-good to a lettable standard."
      ),
    ],
    whatsIncluded: {
      title: "What's included",
      intro:
        "Hard-FM support that plugs into your facilities team &mdash; one partner, one contact, reporting that fits your process.",
      items: [
        "Single account contact across all trades",
        "Reactive callout cover with agreed SLAs",
        "Planned maintenance delivery and reporting",
        "Statutory testing: EICR, PAT, gas, emergency lighting, water, RPZ",
        "Certification and remedial tracking",
        "Asset data capture for audits and mobilisations",
        "Minor works, churn and desk moves",
        "Partitioning, ceilings and decoration",
        "Meeting-room, washroom and kitchen upgrades",
        "Out-of-hours working around occupation",
        "Job costing and reporting in your preferred format",
        "Workmanship guarantee on completed works",
      ],
    },
    process: {
      title: "How facilities support works",
      description:
        "<p>Set up once, then a steady service that fits your team's process &mdash; reactive, planned and projects from one partner.</p>",
      steps: [
        { step: 1, title: "Scope & onboarding", content: "<p>We agree the buildings, services, SLAs and reporting format, and capture the asset and compliance baseline.</p>" },
        { step: 2, title: "Integrate", content: "<p>We align with your helpdesk or CAFM process, access arrangements and permit-to-work requirements.</p>" },
        { step: 3, title: "Deliver", content: "<p>Reactive jobs, planned tasks and minor works are delivered by in-house trades, coordinated by your account contact.</p>" },
        { step: 4, title: "Evidence", content: "<p>Certificates, job records and asset updates are provided in the format your compliance and finance systems need.</p>" },
        { step: 5, title: "Review", content: "<p>Regular reviews keep SLAs, schedules and the forward works plan on track.</p>" },
      ],
    },
    gallery: [],
    faqs: [
      { question: "How is this different from your commercial maintenance service?", answer: "It's the same in-house trades, set up to support an existing facilities or property team — integrating with your helpdesk, SLAs and reporting rather than acting as your only maintenance function." },
      { question: "Can you work with our CAFM / helpdesk system?", answer: "Yes. We align with your job logging, permit-to-work and reporting process so our work shows up the way your team expects." },
      { question: "Do you cover both planned and reactive work?", answer: "Yes — reactive callouts with agreed SLAs, planned maintenance delivery, and minor works / churn, all from one partner." },
      { question: "Can you provide compliance documentation for audits?", answer: "Yes. We provide certification, remedial tracking and asset data for the areas we cover, in a format your compliance system can absorb." },
      { question: "Is completed work guaranteed?", answer: "Yes. All completed works carry a workmanship guarantee, on top of any manufacturer warranties on parts." },
    ],
    cta: {
      title: "Support your facilities team in London?",
      content: "Tell us about the estate and how your team works &mdash; we'll come back with a proposal, free of charge.",
      buttonLabel: "Get your free quote",
      buttonHref: "/contact#quote",
    },
    seo: {
      metaTitle: "Facilities Support in London | BSL Construction",
      metaDescription:
        "Hard-FM facilities support across London — one trade partner for reactive and planned maintenance, statutory compliance, minor works and fit-out churn, integrated with your facilities team's process.",
      keywords: [
        "facilities support london",
        "hard fm london",
        "fm support contractor london",
        "facilities maintenance partner london",
        "minor works contractor london",
        "office churn works london",
        "cafm maintenance contractor london",
        "compliance support london",
      ],
    },
  },
];

/* ---- upsert ---------------------------------------------------------- */

async function run() {
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });

  const now = new Date();
  const collection = mongoose.connection.collection("services");

  for (const svc of SERVICES) {
    const existing = await collection.findOne({ slug: svc.slug });
    const result = await collection.updateOne(
      { slug: svc.slug },
      { $set: { ...svc, updatedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true }
    );

    console.log(
      existing
        ? `Updated  "${svc.title}" (/services/${svc.slug})`
        : `Inserted "${svc.title}" (/services/${svc.slug})${
            result.upsertedId ? ` — _id ${result.upsertedId}` : ""
          }`
    );
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
