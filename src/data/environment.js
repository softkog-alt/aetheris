/**
 * Environment data: harmful exposures, toxins, pollutants, radiation etc.
 * Negative-impact nodes for the Environment constellation.
 * Reuses negative impact patterns from harmful supplements/foods.
 * Scores are deliberately low to reflect harm (red nodes, avoid framing).
 */

export const environment = [
  // Air Pollution & Gases
  {
    id: "pm25",
    name: "PM2.5 Fine Particulate Matter",
    short: "PM2.5",
    cat: "air-pollution",
    impact: "negative",
    longevity: 28,
    qol: 32,
    diseases: 18,
    organs: ["lungs", "heart", "brain", "vascular"],
    mechanisms: [
      "Systemic inflammation via IL-6, TNF-α, CRP",
      "Oxidative stress & mitochondrial damage",
      "Endothelial dysfunction & atherosclerosis",
      "Neuroinflammation & blood-brain barrier leakage"
    ],
    risks: "Cardiovascular disease, COPD, lung cancer, cognitive decline, dementia, low birth weight",
    blurb: "Tiny particles from traffic, wildfires, industry penetrate deep into lungs and bloodstream. One of the top global killers.",
    studies: [{ year: 2023, finding: "Long-term PM2.5 exposure linked to +1-2 years biological age acceleration", source: "Lancet Planet Health" }],
    avoidance: "HEPA air purifiers, avoid rush-hour/outdoor exercise in polluted areas, check AQI daily",
    mitigation: "Support Nrf2 & glutathione (NAC, sulforaphane, exercise in clean air)"
  },
  {
    id: "no2",
    name: "Nitrogen Dioxide (Traffic)",
    short: "NO2",
    cat: "air-pollution",
    impact: "negative",
    longevity: 35,
    qol: 38,
    diseases: 12,
    organs: ["lungs", "heart", "immune"],
    mechanisms: ["Airway inflammation", "Increased asthma & respiratory infections", "Oxidative damage to lung tissue"],
    risks: "Worsened asthma, bronchitis, heart disease, reduced lung development in children",
    blurb: "Mainly from vehicle exhaust. Even low levels impair lung function and increase ER visits.",
    avoidance: "Live/work away from busy roads; close windows during peak traffic; use car cabin filters",
    mitigation: "Antioxidant support (vit C, E, omega-3)"
  },
  {
    id: "o3",
    name: "Ground-level Ozone",
    short: "OZONE",
    cat: "air-pollution",
    impact: "negative",
    longevity: 33,
    qol: 35,
    diseases: 10,
    organs: ["lungs", "heart"],
    mechanisms: ["Reactive oxygen species damaging lung lining", "Inflammation & reduced lung capacity"],
    risks: "Aggravates asthma, COPD, heart arrhythmias on high-ozone days",
    blurb: "Secondary pollutant from sunlight + traffic emissions. Peaks in summer afternoons.",
    avoidance: "Limit outdoor activity 11am-4pm on high AQI days; indoor air filtration"
  },
  {
    id: "formaldehyde",
    name: "Formaldehyde (Furniture & Smoke)",
    short: "FORMALDEHYDE",
    cat: "air-pollution",
    impact: "negative",
    longevity: 38,
    qol: 40,
    diseases: 9,
    organs: ["lungs", "skin", "immune"],
    mechanisms: ["DNA cross-linking & carcinogenicity", "Respiratory tract irritation"],
    risks: "Nasopharyngeal cancer, leukemia risk, eye/skin/respiratory irritation",
    blurb: "Off-gasses from pressed wood furniture, flooring, smoke, personal care products.",
    avoidance: "Choose solid wood or low-VOC furniture; ventilate new items; avoid smoking indoors"
  },

  // Heavy Metals & Industrial
  {
    id: "lead",
    name: "Lead (Old Paint, Water, Dust)",
    short: "LEAD",
    cat: "heavy-metals",
    impact: "negative",
    longevity: 25,
    qol: 28,
    diseases: 20,
    organs: ["brain", "kidney", "heart", "bones"],
    mechanisms: ["Neurotoxicity & synaptic damage", "Oxidative stress", "Hypertension & kidney damage"],
    risks: "Cognitive decline, hypertension, kidney disease, developmental delays in children",
    blurb: "No safe level. Legacy in paint, pipes, soil. Still affects millions via old housing & contaminated water.",
    avoidance: "Test old homes/water; wet-clean dust; use certified filters (NSF for lead)",
    mitigation: "Chelation under medical supervision if high burden; calcium, iron, vit C support"
  },
  {
    id: "mercury",
    name: "Mercury (Fish, Dental, Coal)",
    short: "MERCURY",
    cat: "heavy-metals",
    impact: "negative",
    longevity: 30,
    qol: 32,
    diseases: 14,
    organs: ["brain", "kidney", "heart"],
    mechanisms: ["Binds sulfhydryl groups, disrupts enzymes", "Neuroinflammation"],
    risks: "Tremors, memory loss, cardiovascular disease, fetal neurodevelopmental harm",
    blurb: "Methylmercury bioaccumulates in large fish. Also from old dental amalgams & coal plants.",
    avoidance: "Limit high-mercury fish (tuna, swordfish); consider safe amalgam removal by specialist",
    mitigation: "Selenium, glutathione precursors (NAC), cilantro/chlorella (supportive)"
  },
  {
    id: "arsenic",
    name: "Arsenic (Water, Rice, Pesticides)",
    short: "ARSENIC",
    cat: "heavy-metals",
    impact: "negative",
    longevity: 27,
    qol: 30,
    diseases: 17,
    organs: ["liver", "skin", "lungs", "bladder"],
    mechanisms: ["Oxidative stress & DNA damage", "Epigenetic changes"],
    risks: "Skin lesions, lung/bladder cancers, diabetes, cardiovascular disease",
    blurb: "Contaminant in groundwater and rice. Chronic low-level exposure common in many regions.",
    avoidance: "Test well water; rinse rice thoroughly or choose low-arsenic varieties; vary grains"
  },

  // Plastics & Microplastics
  {
    id: "microplastics",
    name: "Microplastics & Nanoplastics",
    short: "MICROPLASTICS",
    cat: "plastics",
    impact: "negative",
    longevity: 32,
    qol: 35,
    diseases: 11,
    organs: ["gut", "liver", "brain", "repro"],
    mechanisms: ["Physical particle damage", "Leaching of additives + adsorbed toxins", "Microbiome disruption"],
    risks: "Inflammation, oxidative stress, potential endocrine & reproductive disruption",
    blurb: "Found in bottled water, food packaging, air, salt, seafood. Particles cross gut and blood-brain barriers.",
    avoidance: "Avoid plastic bottles & food containers (esp. heated); use glass/stainless; HEPA vacuum",
    mitigation: "Support liver detox pathways; fiber-rich diet for elimination"
  },
  {
    id: "bisphenol-a",
    name: "BPA & Analogs (BPS, BPF)",
    short: "BPA/BPS",
    cat: "plastics",
    impact: "negative",
    longevity: 35,
    qol: 37,
    diseases: 12,
    organs: ["endocrine", "heart", "brain", "repro"],
    mechanisms: ["Potent endocrine disruptor (estrogen mimic)", "Epigenetic & metabolic reprogramming"],
    risks: "Obesity, diabetes, infertility, cardiovascular disease, neurobehavioral effects",
    blurb: "In polycarbonate plastics, can linings, receipts. 'BPA-free' often uses similar disruptors.",
    avoidance: "Never microwave plastics; avoid canned foods unless BPA-free lined; choose glass/steel"
  },
  {
    id: "phthalates",
    name: "Phthalates (Flexible Plastics, Fragrance)",
    short: "PHTHALATES",
    cat: "plastics",
    impact: "negative",
    longevity: 34,
    qol: 36,
    diseases: 10,
    organs: ["repro", "endocrine", "liver"],
    mechanisms: ["Anti-androgenic effects", "PPAR activation & metabolic disruption"],
    risks: "Reduced sperm quality, early puberty, obesity, asthma",
    blurb: "Plasticizers in vinyl, fragrances, personal care. Absorbed through skin and inhalation.",
    avoidance: "Fragrance-free products; avoid vinyl shower curtains/flooring; read ingredient lists"
  },

  // Pesticides
  {
    id: "glyphosate",
    name: "Glyphosate (Roundup & GM Crops)",
    short: "GLYPHOSATE",
    cat: "pesticides",
    impact: "negative",
    longevity: 30,
    qol: 33,
    diseases: 13,
    organs: ["gut", "liver", "immune"],
    mechanisms: ["Shikimate pathway inhibition in gut bacteria", "Oxidative stress & chelation of minerals"],
    risks: "Gut dysbiosis, liver/kidney damage, potential carcinogenicity (IARC)",
    blurb: "Most widely used herbicide. Residues in oats, wheat, beans, wine. Chronic exposure via food.",
    avoidance: "Buy organic; wash produce; reduce ultra-processed grain intake"
  },
  {
    id: "organophosphates",
    name: "Organophosphate Pesticides",
    short: "OP PESTICIDES",
    cat: "pesticides",
    impact: "negative",
    longevity: 28,
    qol: 30,
    diseases: 15,
    organs: ["brain", "nerves"],
    mechanisms: ["Acetylcholinesterase inhibition", "Neurodevelopmental toxicity"],
    risks: "Parkinson's risk, cognitive deficits, developmental delays",
    blurb: "Chlorpyrifos and similar. Banned for home use in many places but still on food supply.",
    avoidance: "Organic produce priority for 'dirty dozen'; wash thoroughly"
  },

  // Radiation & Non-ionizing
  {
    id: "uv",
    name: "Excess Ultraviolet Radiation",
    short: "UV",
    cat: "radiation",
    impact: "negative",
    longevity: 40,
    qol: 42,
    diseases: 12,
    organs: ["skin", "eyes", "immune"],
    mechanisms: ["DNA thymine dimers", "Immunosuppression & photoaging"],
    risks: "Skin cancers (melanoma, BCC, SCC), cataracts, immune suppression",
    blurb: "Sun + tanning beds. Cumulative damage + acute burns.",
    avoidance: "Seek shade 10am-4pm; broad-spectrum SPF 30+; protective clothing; no tanning beds"
  },
  {
    id: "radon",
    name: "Radon Gas (Basements & Soil)",
    short: "RADON",
    cat: "radiation",
    impact: "negative",
    longevity: 25,
    qol: 30,
    diseases: 16,
    organs: ["lungs"],
    mechanisms: ["Alpha particle DNA damage in lung tissue"],
    risks: "Lung cancer (2nd leading cause after smoking)",
    blurb: "Invisible radioactive gas seeps from soil into homes. Test kits are cheap.",
    avoidance: "Test home radon levels; seal cracks; install mitigation system if >4 pCi/L"
  },
  {
    id: "emf",
    name: "Non-ionizing EMF (5G, WiFi, Phones)",
    short: "EMF",
    cat: "radiation",
    impact: "negative",
    longevity: 42,
    qol: 44,
    diseases: 7,
    organs: ["brain", "sleep", "repro"],
    mechanisms: ["Oxidative stress", "Calcium channel disruption (controversial evidence)"],
    risks: "Sleep disruption, headaches, potential long-term cancer & fertility concerns (WHO IARC 2B)",
    blurb: "Ubiquitous. Evidence is mixed but prudent avoidance recommended by some experts.",
    avoidance: "Airplane mode at night; wired connections; keep phone away from body when possible"
  },

  // Water Contaminants
  {
    id: "pfoa-pfos",
    name: "PFAS / Forever Chemicals",
    short: "PFAS",
    cat: "water-contam",
    impact: "negative",
    longevity: 29,
    qol: 31,
    diseases: 14,
    organs: ["liver", "immune", "repro", "thyroid"],
    mechanisms: ["Bioaccumulation & PPAR activation", "Immune & metabolic disruption"],
    risks: "Elevated cholesterol, immune suppression, cancer risk, developmental effects",
    blurb: "Teflon, firefighting foam, stain-resistant coatings. Now in most water supplies & blood.",
    avoidance: "Activated carbon or reverse osmosis filters certified for PFAS; avoid non-stick if damaged"
  },
  {
    id: "chlorine",
    name: "Chlorine & Chloramines (Tap Water)",
    short: "CHLORINE",
    cat: "water-contam",
    impact: "negative",
    longevity: 45,
    qol: 47,
    diseases: 6,
    organs: ["lungs", "skin", "gut"],
    mechanisms: ["Forms disinfection byproducts (THMs, HAAs)", "Irritation & microbiome effects"],
    risks: "Bladder cancer (long-term), respiratory irritation from showers, skin dryness",
    blurb: "Necessary for safety but byproducts and inhalation during showers are concerns.",
    avoidance: "Shower filter; whole-house carbon filter; let water sit or use vitamin C dechlorinator"
  },

  // Household & Personal
  {
    id: "mold",
    name: "Indoor Mold & Mycotoxins",
    short: "MOLD",
    cat: "household",
    impact: "negative",
    longevity: 31,
    qol: 25,
    diseases: 13,
    organs: ["lungs", "brain", "immune"],
    mechanisms: ["Mycotoxin toxicity & inflammation", "Immune activation"],
    risks: "Chronic fatigue, cognitive issues ('brain fog'), asthma, sinusitis",
    blurb: "Hidden in water-damaged buildings. Stachybotrys, aspergillus etc. produce potent toxins.",
    avoidance: "Fix leaks immediately; dehumidify <50% RH; professional remediation if visible growth"
  },
  {
    id: "fragrance",
    name: "Synthetic Fragrances & Phthalates",
    short: "FRAGRANCE",
    cat: "household",
    impact: "negative",
    longevity: 40,
    qol: 42,
    diseases: 8,
    organs: ["endocrine", "respiratory", "skin"],
    mechanisms: ["Phthalate leaching + undisclosed allergens"],
    risks: "Hormone disruption, migraines, respiratory sensitization, contact dermatitis",
    blurb: "In perfumes, cleaners, laundry, 'air fresheners'. 'Fragrance' = trade secret mix.",
    avoidance: "Fragrance-free everything; essential oils only if tolerated (diluted)"
  },
  {
    id: "flame-retardants",
    name: "PBDEs & Flame Retardants",
    short: "FLAME RETARDANTS",
    cat: "household",
    impact: "negative",
    longevity: 36,
    qol: 38,
    diseases: 10,
    organs: ["thyroid", "brain", "repro"],
    mechanisms: ["Thyroid hormone interference", "Neurodevelopmental toxicity"],
    risks: "Lower IQ, ADHD-like symptoms, thyroid disorders, fertility issues",
    blurb: "In old furniture foam, electronics, carpets. Dust is main exposure route.",
    avoidance: "Replace old foam furniture; HEPA vacuum & wet dust; avoid 'flame retardant' labeled items"
  }
];

export const environmentCategories = [
  { key: "all", label: "ALL", icon: "fa-infinity" },
  { key: "air-pollution", label: "AIR POLLUTION", icon: "fa-wind" },
  { key: "heavy-metals", label: "HEAVY METALS", icon: "fa-atom" },
  { key: "plastics", label: "PLASTICS", icon: "fa-recycle" },
  { key: "pesticides", label: "PESTICIDES", icon: "fa-bug" },
  { key: "radiation", label: "RADIATION", icon: "fa-radiation" },
  { key: "water-contam", label: "WATER", icon: "fa-tint" },
  { key: "household", label: "HOUSEHOLD", icon: "fa-home" }
];
