/* Updated content would go here with modifications to first nodes */
/**
 * SUPPLEMENTS NODE TEMPLATE — Inspector & Modal Compatibility Contract
 *
 * ... (keeping the comment the same)
 */

export const supplements = [
      { id: "omega3", name: "Omega-3 EPA/DHA", short: "OMEGA-3", cat: "cardio", longevity: 92, qol: 81, diseases: 14, organs: ["heart", "brain", "eyes"], evidence: "5/5", blurb: "Landmark studies link higher Omega-3 Index to +4.7 years life expectancy. Potent anti-inflammatory. Protects telomeres and brain membranes.",
        vitality: 92,
        mechanisms: ["Lowers triglycerides & blood pressure", "Resolves chronic inflammation via resolvins", "Maintains neuronal membrane fluidity", "Supports telomere length", "Improves HRV and endothelial function", "Modulates eicosanoid balance toward resolution"],
        studies: [{year:2021, finding:"+4.7y life expectancy at high Omega-3 Index (AJCN)", source:"Meta of cohorts"}, {year:2023, finding:"Reduced all-cause & CV mortality (REDUCE-IT follow-up)", source:"RCT"}, {year:2024, finding:"Lower brain atrophy rates in older adults with higher DHA (imaging cohorts)", source:"Neurology meta"}],
        dosage: "1–2 g combined EPA+DHA daily (or Omega-3 Index target >8%)", synergies: ["vitd", "magnesium", "curcumin", "astaxanthin"], 
        gorkipedia: "Gorkipedia Entry: The most robust dietary molecule for human longevity. Multiple large cohorts show blood levels rival not smoking as a mortality predictor. Crosses the blood-brain barrier to literally rebuild the brain's architecture while simultaneously protecting the cardiovascular tree. Best obtained from cold-water fish or high-quality triglyceride-form supplements. Raises the Omega-3 Index which is now used in some clinical practices as a key risk stratifier comparable to apoB or hsCRP.",
        url: "https://grokipedia.app/omega3",
        risks: "High doses may thin blood — consult if on anticoagulants. Choose oxidized-tested brands.",
        timing: "With a meal containing fat for absorption; split doses if >2g.",
        bestForms: "rTG (re-esterified triglyceride) or natural triglyceride forms; IFOS 5-star rated brands for purity.",
        deficiencySigns: "Dry skin, poor concentration, joint stiffness, elevated triglycerides, low mood, cardiovascular risk markers.",
        absorption: "Fat-soluble; take with dietary fat. Emulsified or enteric forms improve tolerability and uptake." },
      { id: "vitd", name: "Vitamin D3", short: "VIT D3", cat: "immune", longevity: 86, qol: 74, diseases: 11, organs: ["bones", "immune", "muscle", "heart"], evidence: "5/5", blurb: "Meta-analyses show 16% reduction in all-cause mortality. Critical for immune modulation, bone density, and mood regulation.",
        vitality: 86,
        mechanisms: ["Gene expression via VDR", "Immune tolerance & antimicrobial peptides", "Calcium homeostasis in muscle & bone", "Anti-proliferative effects", "Modulates innate/adaptive immunity balance", "Upregulates neurotrophic factors"],
        studies: [{year:2022, finding:"16% lower all-cause mortality in supplemented adults (meta 52 trials)", source:"BMJ"}, {year:2024, finding:"Reduced respiratory infection & autoimmune risk", source:"Large RCTs"}, {year:2023, finding:"Falls reduction & improved muscle function in elderly (meta)", source:"JAMA Internal Med"}],
        dosage: "2000–5000 IU daily with K2; test 25(OH)D to target 50–70 ng/mL", synergies: ["vitk2", "magnesium", "omega3", "boron"],
        gorkipedia: "Gorkipedia Entry: The sunshine hormone that became a deficiency disease in the modern world. Receptors exist in almost every tissue. Proper repletion is one of the highest-ROI interventions in preventive medicine, touching immunity, mood, bone, and even DNA repair. Optimal range 50-70 ng/mL balances benefits vs risks; higher not always better.",
        url: "https://grokipedia.app/vitd",
        risks: "Fat-soluble; toxicity rare below 10,000 IU but monitor levels. Pair with K2 to direct calcium. High doses (>10k IU chronic) can cause hypercalcemia, nausea, kidney stones, soft tissue calcification.",
        highDoseRisks: "Doses >10,000 IU/day long-term risk hypercalcemia, vascular calcification (if K2 low), kidney damage, GI symptoms. Always test 25(OH)D; target 50-70 ng/mL, not mega levels. Upper limit ~4,000 IU supplemental for most adults per IOM, though higher used clinically short term under supervision.",
        timing: "Morning or midday with fat-containing meal; consistent daily.",
        bestForms: "D3 (cholecalciferol) not D2; liquid or softgel with MCT or olive oil carrier.",
        deficiencySigns: "Fatigue, bone/joint pain, frequent infections, low mood, slow wound healing, hair loss, muscle weakness.",
        absorption: "Fat soluble — always with meal fat. Malabsorption (gut issues) may require higher doses or topical." },
      { id: "magnesium", name: "Magnesium (Glycinate)", short: "MAGNESIUM", cat: "foundational", longevity: 84, qol: 88, diseases: 9, organs: ["brain", "heart", "muscle", "bones"], evidence: "4/5", blurb: "Involved in 300+ enzymatic reactions. Strongly linked to lower all-cause mortality and dramatically better sleep & recovery.",
        mechanisms: ["ATP stabilization (energy currency)", "NMDA receptor modulation (calm)", "Electrolyte balance for heart rhythm", "Hundreds of kinase reactions", "GABA/glutamate balance", "Supports vitamin D activation & K2 synergy"],
        studies: [{year:2023, finding:"Lower all-cause mortality with higher dietary Mg (meta 1.1M participants)", source:"Nutrients"}, {year:2024, finding:"Improved sleep latency & muscle function in elderly", source:"RCT"}, {year:2022, finding:"Reduced migraine frequency & anxiety scores (meta)", source:"Headache & Nutrients"}],
        dosage: "300–420 mg elemental (glycinate/threonate best for brain/sleep)", synergies: ["vitd", "taurine", "bcomplex", "ltheanine"],
        gorkipedia: "Gorkipedia Entry: The forgotten mineral whose deficiency is nearly universal in modern diets. Master cofactor for energy, nervous system calm, and hundreds of longevity-relevant enzymes. Glycinate form is the daily driver for most humans seeking better sleep and lower allostatic load. Threonate form crosses BBB better for cognitive applications.",
        url: "https://grokipedia.app/magnesium",
        risks: "GI upset at very high doses. Reduce if kidney impairment.",
        highDoseRisks: "Supplemental elemental magnesium >350-400 mg/day often causes diarrhea/loose stools (osmotic). In impaired kidney function, risk of hypermagnesemia (low BP, nausea, cardiac issues). Stick to 200-400 mg elemental from glycinate/threonate for daily use.",
        timing: "Evening 1-2h before bed for sleep benefits; split AM/PM if >350mg.",
        bestForms: "Glycinate (sleep/calm), Threonate (brain), Taurate (cardio), Citrate (laxative effect if needed).",
        deficiencySigns: "Muscle cramps/twitches, insomnia, anxiety/irritability, fatigue, high blood pressure, constipation, migraines.",
        absorption: "Chelated forms (glycinate etc) have superior bioavailability and less GI distress than oxide." },
      { id: "creatine", name: "Creatine Monohydrate", short: "CREATINE", cat: "muscle", longevity: 81, qol: 79, diseases: 7, organs: ["muscle", "brain", "bones"], evidence: "5/5", blurb: "500+ studies. Increases strength, muscle mass, and cognitive performance in aging adults. Powerful for sarcopenia prevention.",
        mechanisms: ["Phosphocreatine energy buffer", "Mitochondrial biogenesis support", "Myostatin inhibition + protein synthesis", "Brain energy & neuroprotection", "Enhances recovery & reduces inflammation post-exercise", "Supports bone density via muscle loading"],
        studies: [{year:2019, finding:"Significant strength & muscle gains in older adults (meta)", source:"JCM"}, {year:2023, finding:"Improved cognition under stress & in elderly", source:"Multiple RCTs"}, {year:2024, finding:"Reduced frailty markers & improved bone mineral in postmenopausal women", source:"J Bone Miner Metab"}],
        dosage: "5 g daily (no loading needed for longevity use)", synergies: ["protein/collagen", "magnesium", "omega3", "hmb"],
        gorkipedia: "Gorkipedia Entry: Once just for bodybuilders, now recognized as a foundational anti-sarcopenia and brain-health molecule. One of the safest, cheapest, and most evidence-dense supplements in existence. Particularly powerful for women post-menopause and anyone over 50. Vegetarians/vegans often have lower baseline stores and respond robustly.",
        url: "https://grokipedia.app/creatine",
        risks: "Very safe. Minor water retention for some. Stay hydrated.",
        timing: "Any time daily; post-workout with carbs/protein optional for athletes. Consistency > timing.",
        bestForms: "Creapure® micronized monohydrate (most researched & purest). No need for fancy forms.",
        deficiencySigns: "Reduced strength/endurance, slower recovery, cognitive fog under stress, lower muscle mass in elderly.",
        absorption: "Take consistently; ~3-5g saturates muscle stores in ~28 days. No cycling needed." },
      // ... (rest of the array remains the same for this section update; full update in subsequent sections) 
    ];

// ... rest of file (categories, organMeta) unchanged for this partial section update
