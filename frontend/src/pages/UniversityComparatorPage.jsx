import React, { useState, useEffect } from 'react';
import {
  Scale,
  Plus,
  Trash2,
  ExternalLink,
  GraduationCap,
  DollarSign,
  Briefcase,
  Award,
  Globe,
  CheckCircle2
} from 'lucide-react';
import { getUniversities, compareUniversitiesApi } from '../services/api';

const DEFAULT_COMPARISON_DATA = [
  {
    id: 1,
    name: "Massachusetts Institute of Technology (MIT)",
    country: "United States",
    city: "Cambridge, MA",
    qsRanking: 1,
    acceptanceRate: "4.0%",
    avgTuitionUSD: 60150,
    avgLivingCostUSD: 22000,
    topFields: ["Computer Science", "Artificial Intelligence", "Robotics"],
    minCGPA: 8.8,
    languageReq: "TOEFL 100+ or IELTS 7.5+",
    greReq: "Recommended (Quant 167+)",
    officialWebsite: "https://www.mit.edu",
    postStudyVisa: "3 Years OPT (STEM)",
    placementDetails: { avgSalary: "$135,000 / year", topRecruiters: ["Google", "Apple", "Microsoft", "OpenAI"], placementRate: "97%" }
  },
  {
    id: 7,
    name: "Technical University of Munich (TUM)",
    country: "Germany",
    city: "Munich",
    qsRanking: 28,
    acceptanceRate: "28.0%",
    avgTuitionUSD: 4000,
    avgLivingCostUSD: 14500,
    topFields: ["Automotive Engineering", "Informatics / CS", "Robotics"],
    minCGPA: 7.5,
    languageReq: "IELTS 6.5+ or TOEFL 88+",
    greReq: "Required for non-EU applicants in some MSc tracks",
    officialWebsite: "https://www.tum.de",
    postStudyVisa: "18 Months Job Seeking Visa",
    placementDetails: { avgSalary: "€68,000 / year", topRecruiters: ["BMW Group", "Siemens", "SAP", "Airbus"], placementRate: "94%" }
  },
  {
    id: 6,
    name: "National University of Singapore (NUS)",
    country: "Singapore",
    city: "Singapore",
    qsRanking: 8,
    acceptanceRate: "11.0%",
    avgTuitionUSD: 28000,
    avgLivingCostUSD: 16000,
    topFields: ["Data Science", "Artificial Intelligence", "Finance"],
    minCGPA: 8.0,
    languageReq: "IELTS 6.5+ or TOEFL 90+",
    greReq: "Recommended (Quant 160+)",
    officialWebsite: "https://www.nus.edu.sg",
    postStudyVisa: "1 Year Long-Term Visit Pass (LTVP)",
    placementDetails: { avgSalary: "S$72,000 / year", topRecruiters: ["Grab", "Shopee", "DBS Bank", "Google SG"], placementRate: "95%" }
  }
];

export default function UniversityComparatorPage({ onNavigate }) {
  const [allUniversities, setAllUniversities] = useState([]);
  const [selectedNames, setSelectedNames] = useState([
    'Massachusetts Institute of Technology (MIT)',
    'Technical University of Munich (TUM)',
    'National University of Singapore (NUS)'
  ]);
  const [comparisonData, setComparisonData] = useState(DEFAULT_COMPARISON_DATA);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadAll() {
      try {
        const res = await getUniversities();
        if (res && res.universities) setAllUniversities(res.universities);
      } catch (e) {}
    }
    loadAll();
  }, []);

  useEffect(() => {
    loadComparison();
  }, [selectedNames]);

  const loadComparison = async () => {
    if (selectedNames.length === 0) {
      setComparisonData([]);
      return;
    }
    setLoading(true);
    try {
      const res = await compareUniversitiesApi(selectedNames);
      if (res && res.comparison && res.comparison.length > 0) {
        setComparisonData(res.comparison);
      }
    } catch (err) {
      console.error('Failed to compare universities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUniversity = (name) => {
    if (!name || selectedNames.includes(name) || selectedNames.length >= 3) return;
    setSelectedNames([...selectedNames, name]);
  };

  const handleRemoveUniversity = (name) => {
    setSelectedNames(selectedNames.filter(n => n !== name));
  };

  return (
    <div className="hub-page-container">
      {/* Header */}
      <div className="hub-header-section">
        <div className="hub-badge">
          <Scale size={14} />
          <span>Decision Matrix</span>
        </div>
        <h1 className="hub-title">University & Program Comparator</h1>
        <p className="hub-subtitle">
          Compare global universities side-by-side across QS rankings, tuition fees, cost of living, admission criteria, and post-study work opportunities.
        </p>
      </div>

      {/* Selectors Bar */}
      <div className="comparator-selectors-card hub-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Compare up to 3 Institutions</h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Currently comparing {selectedNames.length} of 3 universities
            </span>
          </div>

          {selectedNames.length < 3 && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                className="hub-select"
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddUniversity(e.target.value);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
              >
                <option value="" disabled>+ Add University to Compare</option>
                {allUniversities
                  .filter(u => !selectedNames.includes(u.name))
                  .map(u => (
                    <option key={u.id} value={u.name}>
                      {u.name} ({u.country})
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        {/* Selected Badges */}
        <div className="selected-chips-row">
          {selectedNames.map(name => (
            <div key={name} className="selected-uni-chip">
              <GraduationCap size={14} />
              <span>{name}</span>
              <button onClick={() => handleRemoveUniversity(name)} title="Remove from comparison">
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix */}
      {comparisonData.length === 0 ? (
        <div className="hub-empty-state-card">
          <Scale size={32} color="var(--accent-primary)" style={{ opacity: 0.8, marginBottom: '12px' }} />
          <h3>No Universities Selected</h3>
          <p>Select at least 2 universities from the dropdown above to view the side-by-side comparison.</p>
        </div>
      ) : (
        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th className="feature-col">Evaluation Metric</th>
                {comparisonData.map(u => (
                  <th key={u.id} className="uni-header-col">
                    <div className="uni-col-top">
                      <h4 className="uni-col-name">{u.name}</h4>
                      <span className="uni-col-location">{u.city}, {u.country}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* QS World Ranking */}
              <tr>
                <td className="feature-col">
                  <Award size={14} /> QS World Rank
                </td>
                {comparisonData.map(u => (
                  <td key={u.id} className="matrix-val highlight-val">
                    <span className="badge-pill badge-indigo">#{u.qsRanking || u.ranking?.qsWorld || 'Top Tier'}</span>
                  </td>
                ))}
              </tr>

              {/* Annual Tuition Fees */}
              <tr>
                <td className="feature-col">
                  <DollarSign size={14} /> Annual Tuition (USD)
                </td>
                {comparisonData.map(u => (
                  <td key={u.id} className="matrix-val">
                    <strong style={{ color: (u.avgTuitionUSD || 0) < 5000 ? '#10b981' : 'var(--text-primary)' }}>
                      ${(u.avgTuitionUSD || 0).toLocaleString()}
                    </strong>
                    {(u.avgTuitionUSD || 0) < 5000 && <span className="tuition-tag free">Low Tuition</span>}
                  </td>
                ))}
              </tr>

              {/* Annual Living Cost */}
              <tr>
                <td className="feature-col">
                  <DollarSign size={14} /> Est. Living Cost (USD/yr)
                </td>
                {comparisonData.map(u => (
                  <td key={u.id} className="matrix-val">
                    ${(u.avgLivingCostUSD || 15000).toLocaleString()}
                  </td>
                ))}
              </tr>

              {/* Acceptance Rate */}
              <tr>
                <td className="feature-col">Acceptance Rate</td>
                {comparisonData.map(u => (
                  <td key={u.id} className="matrix-val">
                    <span style={{ fontWeight: 600 }}>{u.acceptanceRate || 'Selective'}</span>
                  </td>
                ))}
              </tr>

              {/* Minimum CGPA */}
              <tr>
                <td className="feature-col">Minimum CGPA (Scale 10)</td>
                {comparisonData.map(u => (
                  <td key={u.id} className="matrix-val">
                    {u.minCGPA || 7.5}+
                  </td>
                ))}
              </tr>

              {/* Language Requirement */}
              <tr>
                <td className="feature-col">Language Requirement</td>
                {comparisonData.map(u => (
                  <td key={u.id} className="matrix-val">
                    {u.languageReq || 'IELTS 6.5+ / TOEFL 90+'}
                  </td>
                ))}
              </tr>

              {/* GRE / Standardized Test */}
              <tr>
                <td className="feature-col">GRE / Entrance Test</td>
                {comparisonData.map(u => (
                  <td key={u.id} className="matrix-val">
                    {u.greReq || 'Program Dependent'}
                  </td>
                ))}
              </tr>

              {/* Post-Study Work Visa */}
              <tr>
                <td className="feature-col">
                  <Briefcase size={14} /> Post-Study Work Visa (PSW)
                </td>
                {comparisonData.map(u => (
                  <td key={u.id} className="matrix-val">
                    <span className="psw-text">{u.postStudyVisa || 'Available'}</span>
                  </td>
                ))}
              </tr>

              {/* Top Placement Recruiters */}
              <tr>
                <td className="feature-col">Top Employers & Recruiters</td>
                {comparisonData.map(u => (
                  <td key={u.id} className="matrix-val">
                    <div className="recruiters-tags">
                      {(u.placementDetails?.topRecruiters || ['Google', 'Microsoft', 'Amazon', 'McKinsey', 'Apple']).map((r, i) => (
                        <span key={i} className="recruiter-pill">{r}</span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Official Website */}
              <tr>
                <td className="feature-col">Official Portal</td>
                {comparisonData.map(u => (
                  <td key={u.id} className="matrix-val">
                    <a
                      href={u.officialWebsite || u.website || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="portal-link-btn"
                    >
                      <span>Visit Portal</span>
                      <ExternalLink size={12} />
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
