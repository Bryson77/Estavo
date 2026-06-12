// ── Mock data for Estavo portals ─────────────────────────────────────────────
// Replace with live Supabase queries once env vars are configured.

export const MOCK_ESTATE = {
  id: "1",
  name: "The Hudson Lifestyle Estate",
  address: "Midrand, Gauteng · 184 units",
  unitCount: 184,
  managerName: "Amara Khumalo",
};

export const MOCK_RESIDENTS = [
  { id:"r1", unit:"001", name:"Thabo Mokoena",     email:"thabo@email.com",  type:"Owner",  status:"active",   lastActive:"Today" },
  { id:"r2", unit:"002", name:"Sarah van der Berg", email:"svdb@email.com",  type:"Owner",  status:"active",   lastActive:"Yesterday" },
  { id:"r3", unit:"003", name:"—",                 email:"—",               type:"-",      status:"vacant",   lastActive:"—" },
  { id:"r4", unit:"004", name:"Lerato Dlamini",    email:"lerato@email.com", type:"Tenant", status:"active",   lastActive:"2 days ago" },
  { id:"r5", unit:"005", name:"Priya Naidoo",      email:"priya@email.com",  type:"Owner",  status:"active",   lastActive:"Today" },
  { id:"r6", unit:"006", name:"James Ferreira",    email:"james@email.com",  type:"Owner",  status:"inactive", lastActive:"3 weeks ago" },
  { id:"r7", unit:"007", name:"Nomsa Khumalo",     email:"nomsa@email.com",  type:"Tenant", status:"active",   lastActive:"Today" },
  { id:"r8", unit:"008", name:"Marcus De Lange",   email:"marcus@email.com", type:"Owner",  status:"active",   lastActive:"Yesterday" },
];

export const MOCK_GATES = [
  { id:"g1", name:"Main Entry Gate", status:"online",  type:"vehicle",    lastActivity:"09:14 · Unit 012 entered" },
  { id:"g2", name:"Exit Gate",       status:"online",  type:"vehicle",    lastActivity:"09:01 · Unit 047 exited" },
  { id:"g3", name:"Pedestrian Gate", status:"offline", type:"pedestrian", lastActivity:"Yesterday 18:42" },
];

export const MOCK_ACCESS_LOG = [
  { id:"al1", time:"09:14", person:"Guest Code A8F2",  type:"guest",     gate:"Main Entry Gate", code:"A8F2" },
  { id:"al2", time:"09:01", person:"Unit 012",         type:"resident",  gate:"Main Entry Gate", code:"—" },
  { id:"al3", time:"08:52", person:"Unit 047",         type:"resident",  gate:"Exit Gate",        code:"—" },
  { id:"al4", time:"08:14", person:"Override",         type:"override",  gate:"Main Entry Gate", code:"INC-041" },
  { id:"al5", time:"07:58", person:"Unit 023",         type:"resident",  gate:"Main Entry Gate", code:"—" },
  { id:"al6", time:"07:44", person:"Guest Code K4R9",  type:"guest",     gate:"Main Entry Gate", code:"K4R9" },
  { id:"al7", time:"07:30", person:"Unit 136",         type:"resident",  gate:"Exit Gate",        code:"—" },
];

export const MOCK_MAINTENANCE = [
  { id:"TKT-001", title:"Leaking pipe in common area",    category:"Plumbing",     priority:"high",   status:"submitted",    unit:"012", age:"2h",   assignee:null },
  { id:"TKT-002", title:"Broken gate sensor",             category:"Electrical",   priority:"high",   status:"in_progress",  unit:"Ext", age:"3d",   assignee:"James Dlamini" },
  { id:"TKT-003", title:"Pool pump noise",                category:"Pool",         priority:"medium", status:"under_review",  unit:"040", age:"1d",   assignee:null },
  { id:"TKT-004", title:"Cracked paving at east entrance",category:"Civil",        priority:"low",    status:"assigned",     unit:"Ext", age:"5d",   assignee:"Sipho Khumalo" },
  { id:"TKT-005", title:"Garden lights not working",      category:"Electrical",   priority:"medium", status:"submitted",    unit:"Ext", age:"4h",   assignee:null },
  { id:"TKT-006", title:"Garage door stuck",             category:"Mechanical",   priority:"high",   status:"in_progress",  unit:"018", age:"6h",   assignee:"James Dlamini" },
  { id:"TKT-007", title:"Water pressure low — block C",   category:"Plumbing",     priority:"medium", status:"resolved",     unit:"Ext", age:"—",    assignee:"Sipho Khumalo" },
];

export const MOCK_STAFF = [
  { id:"s1", name:"James Dlamini",   role:"security_guard",  email:"james@hudson.co.za",   status:"active",   lastLogin:"Today" },
  { id:"s2", name:"Priya Reddy",     role:"maintenance",     email:"priya@hudson.co.za",   status:"active",   lastLogin:"Yesterday" },
  { id:"s3", name:"Sipho Khumalo",   role:"gate_operator",   email:"sipho@hudson.co.za",   status:"active",   lastLogin:"Today" },
  { id:"s4", name:"Fatima Cassim",   role:"cleaner",         email:"fatima@hudson.co.za",  status:"inactive", lastLogin:"3 days ago" },
];

export const MOCK_ANNOUNCEMENTS = [
  { id:"a1", title:"AGM reminder",                 priority:"important", sentTo:"All residents", sentAt:"2 days ago",  opens:"94%",  status:"sent" },
  { id:"a2", title:"Pool maintenance Friday",      priority:"info",      sentTo:"All residents", sentAt:"5 days ago",  opens:"87%",  status:"sent" },
  { id:"a3", title:"Water outage — 08:00–10:00",  priority:"urgent",    sentTo:"All residents", sentAt:"1 week ago",  opens:"98%",  status:"sent" },
  { id:"a4", title:"Speed bumps being installed",  priority:"info",      sentTo:"All residents", sentAt:"—",           opens:"—",    status:"scheduled", scheduledFor:"Mon 16 Jun 09:00" },
];

export const MOCK_EMERGENCIES = [
  { id:"EMG-041", unit:"Unit 12", triggered:"10 Jun 15:04", resolved:"15:12", duration:"8m",   officer:"J. Dlamini",  outcome:"No Threat" },
  { id:"EMG-039", unit:"Unit 07", triggered:"8 Jun 23:31",  resolved:"23:38", duration:"7m",   officer:"Priya R.",    outcome:"False Alarm" },
  { id:"EMG-037", unit:"Unit 29", triggered:"2 Jun 20:15",  resolved:"20:28", duration:"13m",  officer:"Sipho K.",    outcome:"Police Dispatched" },
];

export const MOCK_CONTRACTORS = [
  { id:"c1", name:"SA Plumbing Pro",      trade:"Plumbing",      phone:"011 234 5678", email:"info@saplumbing.co.za",  rating:4.2, jobs:7,  status:"active" },
  { id:"c2", name:"PowerFix Electric",    trade:"Electrical",    phone:"072 345 6789", email:"—",                       rating:4.8, jobs:3,  status:"active" },
  { id:"c3", name:"PestAway SA",          trade:"Pest Control",  phone:"083 456 7890", email:"pest@pestaway.co.za",     rating:3.1, jobs:2,  status:"active" },
  { id:"c4", name:"GreenCut Landscaping", trade:"Landscaping",   phone:"061 567 8901", email:"—",                       rating:4.0, jobs:5,  status:"active" },
  { id:"c5", name:"FixIt General",        trade:"General",       phone:"071 678 9012", email:"fixit@general.co.za",     rating:3.8, jobs:1,  status:"inactive" },
];

export const MOCK_APPROVALS = [
  {
    id:"APR-001", title:"Pool pump replacement",     type:"QUOTE",          amount:14800,
    status:"pending",   submitted:"2h ago",    votes:1, required:2,
    description:"Pool pump has failed for the second time in 18 months. Replacement recommended over further repairs.",
    aiSummary:"3 quotes obtained. Cheapest: AquaFix at R14,800. Existing pump repaired twice in 18 months at combined cost of R9,200. Replacement is cost-effective long-term.",
    attachments:["AquaFix_Quote.pdf","PlumbPro_Quote.pdf"],
    trusteeVotes:[
      { name:"John Mokoena", status:"approved",  comment:"Agree with recommendation" },
      { name:"Mary Sithole", status:"pending",   comment:null },
      { name:"David Ferreira", status:"pending", comment:null },
    ]
  },
  {
    id:"APR-002", title:"PestAway invoice — June",   type:"EXPENSE",        amount:3200,
    status:"approved",  submitted:"1 day ago", votes:2, required:2,
    description:"Monthly pest control service — June 2026.",
    aiSummary:"Routine monthly pest control service invoice from PestAway SA. Amount consistent with historical invoices.",
    attachments:["PestAway_Invoice_June.pdf"],
    trusteeVotes:[
      { name:"John Mokoena", status:"approved",  comment:null },
      { name:"Mary Sithole", status:"approved",  comment:null },
      { name:"David Ferreira", status:"pending", comment:null },
    ]
  },
  {
    id:"APR-003", title:"New security vendor onboard",type:"VENDOR ONBOARD", amount:null,
    status:"rejected",  submitted:"3 days ago",votes:1, required:2,
    description:"Proposal to onboard ClearVision Security as the new third-party security management provider.",
    aiSummary:null,
    attachments:["ClearVision_Proposal.pdf"],
    trusteeVotes:[
      { name:"John Mokoena", status:"rejected",  comment:"Prefer current vendor" },
      { name:"Mary Sithole", status:"rejected",  comment:null },
      { name:"David Ferreira", status:"pending", comment:null },
    ]
  },
  {
    id:"APR-004", title:"Conduct rule update — parking",type:"POLICY CHANGE", amount:null,
    status:"more_info", submitted:"5 days ago",votes:0, required:2,
    description:"Proposed amendment to estate rules: resident-only parking in all bays after 20:00.",
    aiSummary:null,
    attachments:[],
    trusteeVotes:[
      { name:"John Mokoena", status:"more_info", comment:"Need to know how visitor parking is handled" },
      { name:"Mary Sithole", status:"pending",   comment:null },
      { name:"David Ferreira", status:"pending", comment:null },
    ]
  },
];

export const MOCK_GUEST_CODES = [
  { code:"A8F2", createdBy:"Unit 136", guestName:"John Smith",   validity:"10–14 Jun", uses:"2/3", status:"inside" },
  { code:"K4R9", createdBy:"Unit 136", guestName:"Maria Santos", validity:"10–12 Jun", uses:"3/3", status:"active" },
  { code:"P2M7", createdBy:"Unit 022", guestName:"David Jones",  validity:"12–13 Jun", uses:"0/2", status:"active" },
];

export const MOCK_MEETINGS = [
  {
    id:"m1", type:"agm",     title:"AGM 2026",
    date:"Thu 19 Feb 2026", time:"18:00–20:00", location:"Clubhouse",
    status:"scheduled", rsvps:67,
    agenda:["1. Review of 2025 financials","2. Trustee election","3. Budget approval for 2026","4. Levy increase proposal"],
    minutes:null,
  },
  {
    id:"m2", type:"trustee", title:"Trustee Meeting — June",
    date:"Mon 16 Jun", time:"18:00", location:"Boardroom",
    status:"scheduled", rsvps:3,
    agenda:["1. APR-001 Pool pump discussion","2. Security staffing review","3. CSOS submission deadline"],
    minutes:null,
  },
  {
    id:"m3", type:"trustee", title:"Trustee Meeting — January",
    date:"Mon 13 Jan", time:"18:00", location:"Boardroom",
    status:"completed", rsvps:3,
    agenda:["1. Pool pump approval","2. Levy increase 8% for 2026","3. Security vendor review"],
    minutes:"Meeting resolved to approve pool pump replacement (AquaFix) and levy increase of 8% for 2026. Security vendor renewal confirmed.",
  },
];

export const MOCK_RESOLUTIONS = [
  { ref:"RES-001", description:"Approved AquaFix pool pump replacement", date:"13 Jan", votes:"3/3", result:"passed" },
  { ref:"RES-002", description:"Levy increase 8% for 2026",              date:"19 Feb", votes:"2/3", result:"passed" },
  { ref:"RES-003", description:"Rejected new security vendor",            date:"5 Mar",  votes:"1/3", result:"rejected" },
];

export const MOCK_DOCUMENTS = [
  { id:"d1", title:"Insurance Certificate",     type:"insurance",  updated:"Mar 2026", expiresAt:new Date("2026-03-31"), status:"valid",   url:"#" },
  { id:"d2", title:"10-Year Maintenance Plan",  type:"plan",       updated:"Jan 2024", expiresAt:null,                   status:"valid",   url:"#" },
  { id:"d3", title:"Audited Financials 2024",   type:"financial",  updated:"Nov 2025", expiresAt:null,                   status:"valid",   url:"#" },
  { id:"d4", title:"HOA / Body Corporate Rules",type:"rules",      updated:"Aug 2023", expiresAt:null,                   status:"valid",   url:"#" },
  { id:"d5", title:"CSOS Submission 2025",       type:"compliance", updated:"Dec 2025", expiresAt:null,                   status:"submitted",url:"#" },
  { id:"d6", title:"POPIA Compliance Record",   type:"compliance", updated:"Nov 2025", expiresAt:new Date("2026-11-01"), status:"valid",   url:"#" },
];

// ── Corporate portfolio ───────────────────────────────────────────────────────

export const MOCK_PORTFOLIO = [
  {
    id:"e1", name:"The Hudson Lifestyle Estate", address:"Midrand, Gauteng", units:184,
    status:"active",   score:87, openTickets:5,  unassigned:2, alerts:1,  levyRate:94, fee:12500, payStatus:"paid",    manager:"Amara Khumalo",   managerLastActive:"14 mins ago",
  },
  {
    id:"e2", name:"Silverwood Estate",           address:"Stellenbosch, WC", units:112,
    status:"active",   score:96, openTickets:2,  unassigned:0, alerts:0,  levyRate:96, fee:8000,  payStatus:"paid",    manager:"Lebo Sithole",    managerLastActive:"2 hrs ago",
  },
  {
    id:"e3", name:"Northgate Villas",            address:"Brackenfell, WC",  units:67,
    status:"attention",score:61, openTickets:11, unassigned:3, alerts:3,  levyRate:71, fee:9500,  payStatus:"overdue", manager:"David Ferreira",  managerLastActive:"3 days ago",
  },
];

export const MOCK_COMPLIANCE = [
  {
    item:"CSOS 2025",
    estates:{
      e1:{ status:"submitted", label:"Submitted" },
      e2:{ status:"submitted", label:"Submitted" },
      e3:{ status:"warning",   label:"Due 15 Jan" },
    }
  },
  {
    item:"Insurance Certificate",
    estates:{
      e1:{ status:"valid",   label:"Valid Mar 2026" },
      e2:{ status:"valid",   label:"Valid" },
      e3:{ status:"expired", label:"EXPIRED" },
    }
  },
  {
    item:"10-Year Plan",
    estates:{
      e1:{ status:"valid",   label:"Updated 2024" },
      e2:{ status:"warning", label:"Last: 2021" },
      e3:{ status:"warning", label:"Last: 2020" },
    }
  },
  {
    item:"Audited Financials 2024",
    estates:{
      e1:{ status:"valid",      label:"Complete" },
      e2:{ status:"in_progress",label:"In progress" },
      e3:{ status:"valid",      label:"Complete" },
    }
  },
  {
    item:"POPIA Review",
    estates:{
      e1:{ status:"valid",   label:"Nov 2025" },
      e2:{ status:"valid",   label:"Oct 2025" },
      e3:{ status:"warning", label:"Overdue" },
    }
  },
];
