window.PEPTIDE_LIBRARY = [
  {
    name: "Semaglutide",
    category: "GLP-1 receptor agonist",
    status: "Approved (Rx)",
    evidenceLevel: "High",
    overview: "GLP-1 receptor agonist studied and approved for glycemic control and chronic weight management in specific indications.",
    commonRisks: ["Nausea", "Vomiting", "Constipation"],
    contraindications: ["Personal/family history of medullary thyroid carcinoma", "MEN2"],
    sources: [
      { label: "FDA Drug Database", url: "https://www.accessdata.fda.gov/scripts/cder/daf/" },
      { label: "PubMed Semaglutide Search", url: "https://pubmed.ncbi.nlm.nih.gov/?term=semaglutide" }
    ]
  },
  {
    name: "Liraglutide",
    category: "GLP-1 receptor agonist",
    status: "Approved (Rx)",
    evidenceLevel: "High",
    overview: "GLP-1 receptor agonist with approved uses in diabetes and chronic weight management in defined populations.",
    commonRisks: ["GI side effects", "Injection site reactions"],
    contraindications: ["MTC/MEN2 history", "Hypersensitivity"],
    sources: [
      { label: "FDA Drug Database", url: "https://www.accessdata.fda.gov/scripts/cder/daf/" },
      { label: "PubMed Liraglutide Search", url: "https://pubmed.ncbi.nlm.nih.gov/?term=liraglutide" }
    ]
  },
  {
    name: "Dulaglutide",
    category: "GLP-1 receptor agonist",
    status: "Approved (Rx)",
    evidenceLevel: "High",
    overview: "Weekly GLP-1 receptor agonist approved for type 2 diabetes management and cardiometabolic risk reduction contexts.",
    commonRisks: ["Nausea", "Diarrhea"],
    contraindications: ["MTC/MEN2 history"],
    sources: [
      { label: "FDA Drug Database", url: "https://www.accessdata.fda.gov/scripts/cder/daf/" },
      { label: "PubMed Dulaglutide Search", url: "https://pubmed.ncbi.nlm.nih.gov/?term=dulaglutide" }
    ]
  },
  {
    name: "Tirzepatide",
    category: "Dual GIP/GLP-1 agonist",
    status: "Approved (Rx)",
    evidenceLevel: "High",
    overview: "Dual incretin agonist (GIP and GLP-1 pathways) approved for specific glycemic and weight-related indications.",
    commonRisks: ["Nausea", "Vomiting", "Diarrhea"],
    contraindications: ["MTC/MEN2 history", "Severe GI disease caution"],
    sources: [
      { label: "FDA Drug Database", url: "https://www.accessdata.fda.gov/scripts/cder/daf/" },
      { label: "PubMed Tirzepatide Search", url: "https://pubmed.ncbi.nlm.nih.gov/?term=tirzepatide" }
    ]
  },
  {
    name: "Retatrutide",
    category: "Triple agonist (GLP-1/GIP/glucagon)",
    status: "Investigational",
    evidenceLevel: "Early",
    overview: "Investigational multi-agonist studied for metabolic indications; currently not broadly approved.",
    commonRisks: ["GI side effects in trials", "Heart rate changes under study"],
    contraindications: ["Not established outside trials"],
    sources: [
      { label: "ClinicalTrials.gov", url: "https://clinicaltrials.gov/" },
      { label: "PubMed Retatrutide Search", url: "https://pubmed.ncbi.nlm.nih.gov/?term=retatrutide" }
    ]
  },
  {
    name: "Teduglutide",
    category: "GLP-2 analog",
    status: "Approved (Rx)",
    evidenceLevel: "High",
    overview: "GLP-2 analog approved for short bowel syndrome support in specific patient populations.",
    commonRisks: ["Abdominal pain", "Fluid overload risk in susceptible patients"],
    contraindications: ["Active GI malignancy caution"],
    sources: [
      { label: "EMA Medicines", url: "https://www.ema.europa.eu/en/medicines" },
      { label: "PubMed Teduglutide Search", url: "https://pubmed.ncbi.nlm.nih.gov/?term=teduglutide" }
    ]
  },
  {
    name: "Tesamorelin",
    category: "GHRH analog",
    status: "Approved (Rx)",
    evidenceLevel: "Moderate",
    overview: "Synthetic growth-hormone releasing factor analog approved for defined HIV-associated lipodystrophy use.",
    commonRisks: ["Arthralgia", "Injection site reactions"],
    contraindications: ["Active malignancy", "Pregnancy"],
    sources: [
      { label: "FDA Drug Database", url: "https://www.accessdata.fda.gov/scripts/cder/daf/" },
      { label: "PubMed Tesamorelin Search", url: "https://pubmed.ncbi.nlm.nih.gov/?term=tesamorelin" }
    ]
  },
  {
    name: "Bremelanotide (PT-141)",
    category: "Melanocortin receptor agonist",
    status: "Approved (Rx)",
    evidenceLevel: "Moderate",
    overview: "Melanocortin agonist approved in specific sexual health indications for premenopausal women.",
    commonRisks: ["Nausea", "Transient blood pressure increase"],
    contraindications: ["Uncontrolled hypertension", "Cardiovascular disease caution"],
    sources: [
      { label: "FDA Drug Database", url: "https://www.accessdata.fda.gov/scripts/cder/daf/" },
      { label: "PubMed Bremelanotide Search", url: "https://pubmed.ncbi.nlm.nih.gov/?term=bremelanotide" }
    ]
  },
  {
    name: "Oxytocin",
    category: "Peptide hormone",
    status: "Approved (Rx)",
    evidenceLevel: "High",
    overview: "Endogenous peptide hormone with approved obstetric indications; off-label use requires clinical oversight.",
    commonRisks: ["Uterine hyperstimulation risk in obstetric use", "Water intoxication with prolonged dosing"],
    contraindications: ["Use depends on obstetric context"],
    sources: [
      { label: "MedlinePlus Drug Info", url: "https://medlineplus.gov/druginformation.html" },
      { label: "PubMed Oxytocin Search", url: "https://pubmed.ncbi.nlm.nih.gov/?term=oxytocin" }
    ]
  },
  {
    name: "CJC-1295",
    category: "GHRH analog (research context)",
    status: "Research / investigational",
    evidenceLevel: "Early",
    overview: "Long-acting GHRH analog frequently marketed online but generally considered investigational outside approved pathways.",
    commonRisks: ["Unknown product quality risk", "Hormonal adverse effects under study"],
    contraindications: ["No broad regulatory approval"],
    sources: [
      { label: "NIH PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/?term=CJC-1295" },
      { label: "FDA Safety Alerts", url: "https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts" }
    ]
  },
  {
    name: "Ipamorelin",
    category: "Growth hormone secretagogue (research context)",
    status: "Research / investigational",
    evidenceLevel: "Early",
    overview: "Peptide secretagogue found in research contexts; not broadly approved for general therapeutic use.",
    commonRisks: ["Data limitations", "Potential endocrine side effects"],
    contraindications: ["No broad regulatory approval"],
    sources: [
      { label: "PubMed Ipamorelin Search", url: "https://pubmed.ncbi.nlm.nih.gov/?term=ipamorelin" },
      { label: "FDA Drug Safety", url: "https://www.fda.gov/drugs/drug-safety-and-availability" }
    ]
  },
  {
    name: "BPC-157",
    category: "Research peptide",
    status: "Research / investigational",
    evidenceLevel: "Early",
    overview: "Frequently discussed online; robust human efficacy and long-term safety data remain limited.",
    commonRisks: ["Unknown purity in non-regulated markets", "Limited high-quality human data"],
    contraindications: ["Not approved as a prescription therapeutic in major markets"],
    sources: [
      { label: "PubMed BPC-157 Search", url: "https://pubmed.ncbi.nlm.nih.gov/?term=BPC-157" },
      { label: "FDA BeSafeRx", url: "https://www.fda.gov/drugs/quick-tips-buying-medicines-over-internet/besafex-safe-internet-pharmacy-practice-sites" }
    ]
  },
  {
    name: "Thymosin Beta-4 / TB-500",
    category: "Research peptide",
    status: "Research / investigational",
    evidenceLevel: "Early",
    overview: "Studied in preclinical and early research settings; not broadly approved for consumer therapeutic use.",
    commonRisks: ["Purity/adulteration concerns", "Limited clinical-grade evidence"],
    contraindications: ["No broad regulatory approval"],
    sources: [
      { label: "PubMed Thymosin Beta-4 Search", url: "https://pubmed.ncbi.nlm.nih.gov/?term=thymosin+beta+4" },
      { label: "WADA Prohibited List", url: "https://www.wada-ama.org/en/prohibited-list" }
    ]
  },
  {
    name: "Sermorelin",
    category: "GHRH analog",
    status: "Limited / compounding context",
    evidenceLevel: "Early",
    overview: "Synthetic GHRH fragment with historical approved use; current availability often occurs via compounding pathways.",
    commonRisks: ["Variable product quality", "Injection site reactions"],
    contraindications: ["Requires licensed prescriber oversight"],
    sources: [
      { label: "FDA Compounding", url: "https://www.fda.gov/drugs/human-drug-compounding" },
      { label: "PubMed Sermorelin Search", url: "https://pubmed.ncbi.nlm.nih.gov/?term=sermorelin" }
    ]
  },
  {
    name: "AOD-9604",
    category: "hGH fragment (research context)",
    status: "Research / investigational",
    evidenceLevel: "Early",
    overview: "hGH fragment explored in metabolic research contexts; regulatory approval is limited by region and indication.",
    commonRisks: ["Limited large-scale clinical evidence", "Quality variability in non-regulated products"],
    contraindications: ["No broad global approval"],
    sources: [
      { label: "PubMed AOD-9604 Search", url: "https://pubmed.ncbi.nlm.nih.gov/?term=AOD-9604" },
      { label: "EMA Medicines", url: "https://www.ema.europa.eu/en/medicines" }
    ]
  }
];
