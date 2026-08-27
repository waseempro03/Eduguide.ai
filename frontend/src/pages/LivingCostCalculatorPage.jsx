import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Globe,
  Home,
  Utensils,
  ShieldCheck,
  Bus,
  Zap,
  Coffee,
  Briefcase,
  Info
} from 'lucide-react';
import { getLivingCosts } from '../services/api';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' }
];

const DEFAULT_COST_DATA = {
  exchangeRates: { USD: 1.0, EUR: 0.92, GBP: 0.79, INR: 83.5, CAD: 1.36, AUD: 1.52, SGD: 1.35, CHF: 0.89 },
  targetCurrency: 'USD',
  countries: [
    {
      country: "Germany",
      flag: "🇩🇪",
      currency: "EUR",
      currencySymbol: "€",
      blockedAccountRequired: true,
      blockedAccountAmountEUR: 11208,
      displayMonthlyTotal: 1050,
      displayBreakdown: { rent: 450, food: 250, healthInsurance: 120, transport: 49, utilitiesAndInternet: 80, leisure: 100 },
      workRights: "140 full days or 280 half days per year",
      pswDuration: "18 Months Job Seeking Visa",
      tips: "Public universities charge nominal semester fee (~€150-€350). The 'Deutschlandticket' covers all regional public transit for €49/month."
    },
    {
      country: "United States",
      flag: "🇺🇸",
      currency: "USD",
      currencySymbol: "$",
      blockedAccountRequired: false,
      displayMonthlyTotal: 1850,
      displayBreakdown: { rent: 950, food: 400, healthInsurance: 180, transport: 100, utilitiesAndInternet: 120, leisure: 100 },
      workRights: "Up to 20 hrs/week on-campus during semesters, full-time during breaks",
      pswDuration: "3 Years OPT (STEM)",
      tips: "Health insurance is mandatory. Living off-campus with roommates drastically lowers accommodation expense."
    },
    {
      country: "United Kingdom",
      flag: "🇬🇧",
      currency: "GBP",
      currencySymbol: "£",
      blockedAccountRequired: false,
      displayMonthlyTotal: 1600,
      displayBreakdown: { rent: 800, food: 300, healthInsurance: 65, transport: 90, utilitiesAndInternet: 100, leisure: 120 },
      workRights: "Up to 20 hrs/week during term-time",
      pswDuration: "2 Years Graduate Route (3 Years for PhD)",
      tips: "NHS Immigration Health Surcharge (£776/yr) paid with visa. London costs ~30-40% more than northern cities."
    },
    {
      country: "Canada",
      flag: "🇨🇦",
      currency: "CAD",
      currencySymbol: "CA$",
      blockedAccountRequired: true,
      gicRequiredCAD: 20635,
      displayMonthlyTotal: 1400,
      displayBreakdown: { rent: 750, food: 320, healthInsurance: 75, transport: 85, utilitiesAndInternet: 90, leisure: 80 },
      workRights: "Up to 24 hrs/week off-campus during academic session",
      pswDuration: "Up to 3 Years Post-Graduation Work Permit (PGWP)",
      tips: "Guaranteed Investment Certificate (GIC) of CA$20,635 mandatory for study permit under SDS."
    }
  ]
};

export default function LivingCostCalculatorPage({ onNavigate }) {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [costData, setCostData] = useState(DEFAULT_COST_DATA);
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COST_DATA.countries[0]);
  const [lifestyleMultiplier, setLifestyleMultiplier] = useState(1.0); // 0.8 = frugal, 1.0 = balanced, 1.3 = luxury

  useEffect(() => {
    loadData();
  }, [selectedCurrency]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getLivingCosts(selectedCurrency);
      if (res && res.countries && res.countries.length > 0) {
        setCostData(res);
        const updated = res.countries.find(c => c.country === selectedCountry?.country) || res.countries[0];
        setSelectedCountry(updated);
      }
    } catch (err) {
      console.error('Failed to load living costs:', err);
    } finally {
      setLoading(false);
    }
  };

  const currSymbol = CURRENCIES.find(c => c.code === selectedCurrency)?.symbol || '$';

  return (
    <div className="hub-page-container">
      {/* Header */}
      <div className="hub-header-section">
        <div className="hub-badge">
          <DollarSign size={14} />
          <span>Financial Planning Hub</span>
        </div>
        <h1 className="hub-title">Living Cost & Currency Calculator</h1>
        <p className="hub-subtitle">
          Calculate real-world monthly student living expenses, blocked account requirements, and student part-time wages across top global study destinations.
        </p>
      </div>

      {/* Global Controls: Currency Selector & Lifestyle Slider */}
      <div className="calc-controls-card">
        <div className="calc-control-group">
          <label><Globe size={14} /> Base Currency Display</label>
          <div className="currency-pill-list">
            {CURRENCIES.map(curr => (
              <button
                key={curr.code}
                className={`currency-pill-btn ${selectedCurrency === curr.code ? 'active' : ''}`}
                onClick={() => setSelectedCurrency(curr.code)}
              >
                <strong>{curr.code}</strong> <span>({curr.symbol})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="calc-control-group" style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label>Lifestyle Tier & Accommodation Style</label>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
              {lifestyleMultiplier === 0.8 ? 'Frugal (Shared Room / Cook at home)' : lifestyleMultiplier === 1.0 ? 'Balanced Student Life' : 'Premium / Single Studio'}
            </span>
          </div>
          <div className="lifestyle-toggle-row">
            <button
              className={`lifestyle-btn ${lifestyleMultiplier === 0.8 ? 'active' : ''}`}
              onClick={() => setLifestyleMultiplier(0.8)}
            >
              Frugal Saver (0.8x)
            </button>
            <button
              className={`lifestyle-btn ${lifestyleMultiplier === 1.0 ? 'active' : ''}`}
              onClick={() => setLifestyleMultiplier(1.0)}
            >
              Standard Student (1.0x)
            </button>
            <button
              className={`lifestyle-btn ${lifestyleMultiplier === 1.3 ? 'active' : ''}`}
              onClick={() => setLifestyleMultiplier(1.3)}
            >
              Independent / Studio (1.3x)
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Country Grid & Breakdown Details */}
      <div className="calc-main-layout">
        {/* Country Selector Cards */}
        <div className="calc-countries-grid">
          {costData?.countries?.map(c => {
            const adjustedMonthly = Math.round(c.displayMonthlyTotal * lifestyleMultiplier);
            const isSelected = selectedCountry?.country === c.country;

            return (
              <div
                key={c.country}
                className={`country-cost-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedCountry(c)}
              >
                <div className="country-card-top">
                  <span className="country-flag-emoji">{c.flag}</span>
                  <div>
                    <h4 className="country-card-name">{c.country}</h4>
                    <span className="country-native-curr">Local: {c.currencySymbol} ({c.currency})</span>
                  </div>
                </div>

                <div className="country-card-price">
                  <span className="price-amount">{currSymbol} {adjustedMonthly.toLocaleString()}</span>
                  <span className="price-period">/ month (est.)</span>
                </div>

                {c.blockedAccountRequired && (
                  <div className="blocked-account-chip">
                    <ShieldCheck size={13} />
                    <span>Financial Guarantee Required</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Country Detailed Breakdown Panel */}
        {selectedCountry && (
          <div className="calc-details-panel hub-card">
            <div className="panel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.8rem' }}>{selectedCountry.flag}</span>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{selectedCountry.country} Cost Breakdown</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Estimated Total: {currSymbol} {Math.round(selectedCountry.displayMonthlyTotal * lifestyleMultiplier).toLocaleString()} / month
                  </span>
                </div>
              </div>
            </div>

            {/* Expense Categories Breakdown */}
            <div className="expense-items-grid">
              <div className="expense-box">
                <div className="expense-icon home"><Home size={18} /></div>
                <div className="expense-info">
                  <span className="expense-name">Accommodation / Rent</span>
                  <strong className="expense-val">
                    {currSymbol} {Math.round(selectedCountry.displayBreakdown.rent * lifestyleMultiplier).toLocaleString()}
                  </strong>
                </div>
              </div>

              <div className="expense-box">
                <div className="expense-icon food"><Utensils size={18} /></div>
                <div className="expense-info">
                  <span className="expense-name">Groceries & Food</span>
                  <strong className="expense-val">
                    {currSymbol} {Math.round(selectedCountry.displayBreakdown.food * lifestyleMultiplier).toLocaleString()}
                  </strong>
                </div>
              </div>

              <div className="expense-box">
                <div className="expense-icon health"><ShieldCheck size={18} /></div>
                <div className="expense-info">
                  <span className="expense-name">Health Insurance</span>
                  <strong className="expense-val">
                    {currSymbol} {Math.round(selectedCountry.displayBreakdown.healthInsurance * lifestyleMultiplier).toLocaleString()}
                  </strong>
                </div>
              </div>

              <div className="expense-box">
                <div className="expense-icon bus"><Bus size={18} /></div>
                <div className="expense-info">
                  <span className="expense-name">Public Transport</span>
                  <strong className="expense-val">
                    {currSymbol} {Math.round(selectedCountry.displayBreakdown.transport * lifestyleMultiplier).toLocaleString()}
                  </strong>
                </div>
              </div>

              <div className="expense-box">
                <div className="expense-icon zap"><Zap size={18} /></div>
                <div className="expense-info">
                  <span className="expense-name">Utilities & Internet</span>
                  <strong className="expense-val">
                    {currSymbol} {Math.round(selectedCountry.displayBreakdown.utilitiesAndInternet * lifestyleMultiplier).toLocaleString()}
                  </strong>
                </div>
              </div>

              <div className="expense-box">
                <div className="expense-icon leisure"><Coffee size={18} /></div>
                <div className="expense-info">
                  <span className="expense-name">Personal & Leisure</span>
                  <strong className="expense-val">
                    {currSymbol} {Math.round(selectedCountry.displayBreakdown.leisure * lifestyleMultiplier).toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>

            {/* Part-time & Visa Requirements Info */}
            <div className="visa-financials-card">
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <Briefcase size={16} color="var(--accent-primary)" />
                Work Rights & Visa Financials
              </h4>
              <div className="financials-rows">
                <div className="fin-row">
                  <span>Student Work Rights:</span>
                  <strong>{selectedCountry.workRights}</strong>
                </div>
                <div className="fin-row">
                  <span>Post-Study Work (PSW):</span>
                  <strong>{selectedCountry.pswDuration}</strong>
                </div>
                {selectedCountry.blockedAccountRequired && (
                  <div className="fin-row highlight">
                    <span>Blocked Account / GIC Required:</span>
                    <strong>
                      {selectedCountry.blockedAccountAmountEUR ? `€${selectedCountry.blockedAccountAmountEUR.toLocaleString()}` :
                       selectedCountry.gicRequiredCAD ? `CA$${selectedCountry.gicRequiredCAD.toLocaleString()}` :
                       selectedCountry.blockedAccountAmountCHF ? `CHF ${selectedCountry.blockedAccountAmountCHF.toLocaleString()}` : 'Mandatory'}
                    </strong>
                  </div>
                )}
              </div>

              {selectedCountry.tips && (
                <div className="country-pro-tip">
                  <Info size={14} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--accent-primary)' }} />
                  <p>{selectedCountry.tips}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
