export interface LocalAgentDefinition {
  id: string;
  name: string;
  domain: string;
  enabled: true;
  execution: "persistent-local";
  expiresAt: null;
  requiresInternet: false;
}

const definitions = [
  ["orchestrator", "Master Orchestrator", "governance"],
  ["erp-architect", "ERP Architect Agent", "governance"],
  ["code-completion", "Code Completion Agent", "governance"],
  ["qa-testing", "QA Testing Agent", "governance"],
  ["security", "Security Agent", "governance"],
  ["audit", "Audit Agent", "governance"],
  ["farm-operations", "Farm Operations Agent", "aquaculture"],
  ["pond-intelligence", "Pond Intelligence Agent", "aquaculture"],
  ["feeding", "Feeding Agent", "aquaculture"],
  ["fcr", "FCR Analytics Agent", "aquaculture"],
  ["biometry", "Biometry Agent", "aquaculture"],
  ["mortality", "Mortality Agent", "aquaculture"],
  ["transfer", "Transfer Agent", "aquaculture"],
  ["water", "Water Quality Agent", "aquaculture"],
  ["water-anomaly", "Water Anomaly Agent", "aquaculture"],
  ["hatchery", "Hatchery Agent", "hatchery"],
  ["genetics", "Genetics & Broodstock Agent", "hatchery"],
  ["laboratory", "Laboratory Agent", "aquaculture"],
  ["fish-health", "Fish Health Agent", "aquaculture"],
  ["medication", "Medication Agent", "aquaculture"],
  ["feed-factory", "Feed Factory Agent", "supply-chain"],
  ["warehouse", "Warehouse Agent", "supply-chain"],
  ["procurement", "Procurement Agent", "supply-chain"],
  ["cold-storage", "Cold Storage Agent", "supply-chain"],
  ["processing", "Processing Agent", "production"],
  ["caviar", "Caviar Production Agent", "production"],
  ["sales", "Sales & Customer Agent", "business"],
  ["accounting", "Accounting Agent", "business"],
  ["hr", "HR & Staff Agent", "business"],
  ["notification", "Notification Agent", "business"],
  ["internal-chat", "Internal Chat Agent", "business"],
  ["documents", "Document Archive Agent", "intelligence"],
  ["knowledge", "Knowledge Base RAG Agent", "intelligence"],
  ["management-bi", "Management BI Agent", "intelligence"],
  ["anomaly", "Anomaly Detection Agent", "intelligence"],
  ["forecasting", "Forecasting Agent", "intelligence"],
  ["data-quality", "Data Quality Agent", "intelligence"],
  ["database-integrity", "Database Integrity Agent", "intelligence"],
  ["backup", "Backup & Recovery Agent", "infrastructure"],
  ["performance", "Performance Agent", "infrastructure"],
  ["localization", "Localization Agent", "infrastructure"],
  ["offline-ai", "Offline AI Manager Agent", "infrastructure"],
  ["ai-router", "AI Router Agent", "infrastructure"],
  ["voice", "Voice Agent", "infrastructure"],
  ["vision", "Vision Agent", "infrastructure"],
  ["maintenance", "Developer Maintenance Agent", "infrastructure"],
  ["deployment", "Deployment Agent", "infrastructure"],
  ["compliance", "Compliance & Permission Agent", "governance"],
  ["media-ingest", "Media Ingest Agent", "media"],
  ["media-curation", "Media Curation Agent", "media"],
  ["photo-editing", "Photo Editing Agent", "media"],
  ["video-editing", "Video Editing Agent", "media"],
  ["brand", "Brand Consistency Agent", "media"],
  ["vision-content", "Vision Content Agent", "media"],
  ["copywriting", "Social Copywriting Agent", "media"],
  ["hashtag-seo", "Hashtag & SEO Agent", "media"],
  ["instagram", "Instagram Publishing Agent", "media"],
  ["linkedin", "LinkedIn Publishing Agent", "media"],
  ["website", "Website Publishing Agent", "media"],
  ["social-scheduler", "Social Scheduler Agent", "media"],
  ["social-compliance", "Social Compliance Agent", "media"],
  ["social-analytics", "Social Analytics Agent", "media"]
] as const;

export const LOCAL_AGENT_REGISTRY: LocalAgentDefinition[] = definitions.map(([id, name, domain]) => ({
  id, name, domain, enabled: true, execution: "persistent-local", expiresAt: null, requiresInternet: false
}));

export function initializePermanentAgents(): void {
  localStorage.setItem("fathi_local_agents_v1", JSON.stringify({
    version: 1,
    initializedAt: new Date().toISOString(),
    license: "perpetual-local",
    agents: LOCAL_AGENT_REGISTRY
  }));
}
