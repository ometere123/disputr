export const dashboardMetrics = [
  {
    label: "Total Volume Arbitrated",
    value: "14.2M",
    unit: "GEN",
    trend: "+12% this month",
    icon: "wallet"
  },
  {
    label: "Active Disputes",
    value: "48",
    unit: "",
    trend: "12 requiring attention",
    icon: "gavel"
  },
  {
    label: "Recent Verdicts",
    value: "124",
    unit: "",
    trend: "Resolved in last 30 days",
    icon: "check"
  }
];

export const activeDisputes = [
  {
    id: "#1042",
    title: "Freelance Contract Breach - Design Asset Delivery",
    amount: "5,000 USDC",
    status: "Pending",
    action: "Review",
    category: "Software Dev",
    phase: "Voting Phase",
    deadline: "14h 22m",
    summary: "Client claims milestones 2 and 3 were not met according to specifications."
  },
  {
    id: "#1041",
    title: "NFT Marketplace Royalty Dispute",
    amount: "12.5 GEN",
    status: "Evaluating",
    action: "Details",
    category: "Marketplace",
    phase: "Evidence Phase",
    deadline: "2d 10h",
    summary: "Seller contests royalty distribution after a secondary-market settlement."
  },
  {
    id: "#1038",
    title: "DAO Treasury Allocation Vote Contest",
    amount: "-",
    status: "Resolved",
    action: "View Verdict",
    category: "Governance",
    phase: "Resolved",
    deadline: "Closed",
    summary: "A delegate challenged the evidence used to finalize a treasury allocation."
  }
];

export const verdict = {
  id: "#90210",
  title: "Freelance Contract Dispute",
  status: "Verdict Delivered",
  resolvedAt: "Oct 24, 2023",
  confidence: 0.942,
  winner: "Claimant",
  summary:
    "The tribunal finds in favor of the Claimant. The submitted codebase demonstrates substantial completion of the agreed-upon milestones as defined in the signed scope. The respondent's quality objection lacks objective technical metrics in the original agreement.",
  trace: [
    {
      label: "Verified Contract Terms",
      detail: "Section 3.1 mandates delivery of REST API endpoints.",
      match: 1
    },
    {
      label: "Analyzed Commit History",
      detail: "Repository activity aligns with milestone descriptions.",
      match: 0.92
    },
    {
      label: "Reviewed Respondent Communications",
      detail: "Counter-evidence was weighed against the original scope.",
      match: 0.72
    }
  ],
  weights: [
    {
      side: "Claimant Evidence",
      value: 0.78,
      sources: [
        ["GitHub Commits", "High"],
        ["Slack Logs", "Medium"]
      ]
    },
    {
      side: "Respondent Evidence",
      value: 0.22,
      sources: [
        ["Bug Reports", "Low"],
        ["Email Thread", "Low"]
      ]
    }
  ]
};

export const apiKeys = [
  {
    name: "Production Backend",
    token: "dk_live_...9f2a",
    scopes: ["read:verdicts", "write:disputes"],
    created: "Oct 12, 2023"
  },
  {
    name: "Staging Env",
    token: "dk_test_...3b1c",
    scopes: ["read:verdicts"],
    created: "Nov 05, 2023"
  }
];

export const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    target: "Wallets and individuals",
    includes: ["5 disputes per month", "Public verdict reads", "Dashboard access"]
  },
  {
    name: "Pro",
    price: "$29",
    target: "Power users and freelancers",
    includes: ["Unlimited disputes", "Priority verdict queue", "Credential API"]
  },
  {
    name: "Builder",
    price: "$199",
    target: "Marketplaces and escrow protocols",
    includes: ["Full API access", "Webhook fanout", "Custom appeal windows"]
  },
  {
    name: "Enterprise",
    price: "Custom",
    target: "Large platforms and DAOs",
    includes: ["White-label flows", "Dedicated RPC", "Audit log exports"]
  }
];
