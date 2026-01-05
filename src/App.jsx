import { useState, useEffect, useMemo } from "react";
import PolicySelector from "./components/PolicySelector";
import ConstituencySelector from "./components/ConstituencySelector";
import YearSlider from "./components/YearSlider";
import LocalAreaTab from "./components/LocalAreaTab";
import "./App.css";

// Autumn Budget 2025 policy provisions
const POLICIES = [
  {
    id: "two_child_limit",
    name: "2 child limit repeal",
    description: "Repeal the two-child limit on benefits",
    explanation:
      'The two-child limit restricts Universal Credit and Child Tax Credit payments to a maximum number of children per family. Removing this limit allows families to claim child-related benefit payments for all children without a cap. The Government estimates this will reduce child poverty by 450,000 by 2029-30. See our <a href="https://policyengine.org/uk/research/uk-two-child-limit" target="_blank" rel="noopener noreferrer">research report</a> for details.',
  },
  {
    id: "fuel_duty_freeze",
    name: "Fuel duty freeze extension",
    description: "Freeze fuel duty rates until September 2026",
    explanation:
      'The baseline assumes the 5p cut ends on 22 March 2026, returning the rate to 57.95p, followed by RPI uprating from April 2026. The announced policy (reform) maintains the freeze at 52.95p until September 2026, then implements a staggered reversal with increases of 1p, 2p, and 2p over three-month periods, reaching 57.95p by March 2027. Both then apply annual RPI uprating. See our <a href="https://policyengine.org/uk/research/fuel-duty-freeze-2025" target="_blank" rel="noopener noreferrer">research report</a> for details.',
  },
  {
    id: "rail_fares_freeze",
    name: "Rail fares freeze",
    description: "Freeze regulated rail fares for one year from March 2026",
    explanation:
      'Freezes regulated rail fares in England for one year from March 2026 - the first freeze in 30 years. Without the freeze, fares would have increased by 5.8% under the RPI formula. The Government estimates this will save passengers £600 million in 2026-27, with commuters on expensive routes saving over £300 per year. See our <a href="https://policyengine.org/uk/research/rail-fares-freeze-2025" target="_blank" rel="noopener noreferrer">research report</a> for details.',
  },
  {
    id: "threshold_freeze_extension",
    name: "Threshold freeze extension",
    description: "Extend the freeze on income tax thresholds to 2030-31",
    explanation:
      "This policy extends the freeze on income tax thresholds from 2027-28 to 2030-31. The personal allowance remains frozen at £12,570, the higher-rate threshold at £50,270, and the additional-rate threshold at £125,140. The NICs secondary threshold is also frozen. By 2030-31, the OBR estimates this will bring 5.2 million additional individuals into paying income tax.",
  },
  {
    id: "dividend_tax_increase_2pp",
    name: "Dividend tax increase (+2pp)",
    description:
      "Increase dividend tax rates by 2 percentage points from April 2026",
    explanation:
      "Increases dividend tax rates by 2 percentage points from April 2026. Basic rate: 8.75% → 10.75%, Higher rate: 33.75% → 35.75%. The additional rate remains at 39.35%. OBR estimates this will raise £1.0-1.1bn annually from 2027-28.",
  },
  {
    id: "savings_tax_increase_2pp",
    name: "Savings income tax increase (+2pp)",
    description:
      "Increase savings income tax rates by 2 percentage points from April 2027",
    explanation:
      "Increases savings income tax rates by 2 percentage points from April 2027. Basic: 20% → 22%, Higher: 40% → 42%, Additional: 45% → 47%. OBR estimates this will raise £0.5bn annually from 2028-29. Note: FRS data may underreport savings income.",
  },
  {
    id: "property_tax_increase_2pp",
    name: "Property income tax increase (+2pp)",
    description:
      "Increase property income tax rates by 2 percentage points from April 2027",
    explanation:
      "Increases property income tax rates by 2 percentage points from April 2027. Basic: 20% → 22%, Higher: 40% → 42%, Additional: 45% → 47%. OBR estimates this will raise £0.4-0.6bn annually from 2028-29. Note: Property income may not be fully captured in FRS.",
  },
  {
    id: "freeze_student_loan_thresholds",
    name: "Freeze student loan repayment thresholds",
    description:
      "Freeze Plan 2 repayment thresholds from 2027-28 to 2029-30",
    explanation:
      "Freezes the Plan 2 student loan repayment threshold at £29,385 for three years from April 2027, instead of allowing RPI uprating. This means graduates start repaying at a lower real income level, increasing repayments. OBR estimates this raises £255-355m annually from 2027-30. Note: The OBR figure for 2026-27 (£5.9bn) is significantly higher because it includes a one-off student loan revaluation that year, where the Government revalued existing student loan balances. Our microsimulation focuses only on the threshold freeze starting in 2027.",
  },
  {
    id: "salary_sacrifice_cap",
    name: "Salary sacrifice cap",
    description: "Cap NI-free salary sacrifice pension contributions at £2,000",
    explanation:
      'Caps National Insurance-free salary sacrifice pension contributions at £2,000 per year from April 2029. Contributions above this threshold become subject to employee and employer NICs. PolicyEngine estimates this will raise £3.3bn in 2029-30, assuming employers spread costs and employees maintain pension contributions. The OBR estimates £4.9bn (static) or £4.7bn (post-behavioural). See our <a href="https://policyengine.org/uk/research/uk-salary-sacrifice-cap" target="_blank" rel="noopener noreferrer">research report</a> for details.',
  },
];

function parseCSV(csvText) {
  const lines = csvText.trim().split("\n");

  // Parse a single CSV line handling quoted fields
  const parseLine = (line) => {
    const values = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  };

  const headers = parseLine(lines[0]);
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx];
    });
    data.push(row);
  }
  return data;
}

function App() {
  const [selectedPolicies, setSelectedPolicies] = useState(
    POLICIES.map((p) => p.id),
  );
  const [selectedConstituency, setSelectedConstituency] = useState(null);
  const [selectedYear, setSelectedYear] = useState(2029);
  const [constituencyData, setConstituencyData] = useState(null);

  // Extract unique constituencies for selector
  const constituencies = useMemo(() => {
    if (!constituencyData) return [];

    const uniqueMap = new Map();
    constituencyData.forEach((row) => {
      if (!uniqueMap.has(row.constituency_code)) {
        uniqueMap.set(row.constituency_code, {
          code: row.constituency_code,
          name: row.constituency_name,
        });
      }
    });

    return Array.from(uniqueMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [constituencyData]);

  // Load constituency data for selector
  useEffect(() => {
    const loadConstituencies = async () => {
      try {
        const res = await fetch("/data/constituency.csv");
        const csvText = await res.text();
        setConstituencyData(parseCSV(csvText));
      } catch (error) {
        console.error("Error loading constituency data:", error);
      }
    };
    loadConstituencies();
  }, []);

  // Resolve constituency name when data loads (for URL-initialized selections)
  useEffect(() => {
    if (selectedConstituency && constituencyData && selectedConstituency.code === selectedConstituency.name) {
      const found = constituencyData.find(
        (row) => row.constituency_code === selectedConstituency.code
      );
      if (found) {
        setSelectedConstituency({
          code: found.constituency_code,
          name: found.constituency_name,
        });
      }
    }
  }, [constituencyData, selectedConstituency]);

  // Valid policy IDs from POLICIES
  const validPolicyIds = POLICIES.map((p) => p.id);

  // Initialize from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const policiesParam = params.get("policies");
    const constituencyParam = params.get("constituency");

    if (constituencyParam) {
      // We'll set the constituency name later when data loads
      setSelectedConstituency({ code: constituencyParam, name: constituencyParam });
    }

    if (policiesParam) {
      // Filter to only include valid policy IDs
      const policies = policiesParam
        .split(",")
        .filter((id) => validPolicyIds.includes(id));
      setSelectedPolicies(policies);
    }
  }, []);

  // Update URL when policies or constituency change
  useEffect(() => {
    const params = new URLSearchParams();

    if (selectedPolicies.length > 0) {
      params.set("policies", selectedPolicies.join(","));
    }
    if (selectedConstituency) {
      params.set("constituency", selectedConstituency.code);
    }

    const newUrl = params.toString()
      ? `?${params.toString()}`
      : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
  }, [selectedPolicies, selectedConstituency]);

  const handlePolicyToggle = (policyId) => {
    setSelectedPolicies((prev) => {
      if (prev.includes(policyId)) {
        return prev.filter((id) => id !== policyId);
      } else {
        return [...prev, policyId];
      }
    });
  };

  return (
    <div className="app">
      <main className="main-content">
        {/* Title row with controls */}
        <div className="title-row">
          <h1>UK Autumn Budget 2025: Local area analysis</h1>
          <div className="local-selectors">
            <div className="selectors-row">
              <ConstituencySelector
                constituencies={constituencies}
                selectedConstituency={selectedConstituency}
                onConstituencySelect={setSelectedConstituency}
              />
              <PolicySelector
                policies={POLICIES}
                selectedPolicies={selectedPolicies}
                onPolicyToggle={handlePolicyToggle}
              />
            </div>
            <YearSlider
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
            />
          </div>
        </div>

        {/* Local Area Tab Content */}
        <LocalAreaTab
          policies={POLICIES}
          selectedPolicies={selectedPolicies}
          selectedConstituency={selectedConstituency}
          onConstituencySelect={setSelectedConstituency}
          selectedYear={selectedYear}
        />
      </main>
    </div>
  );
}

export default App;
