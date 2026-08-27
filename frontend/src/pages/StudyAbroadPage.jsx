import React, { useState } from 'react';
import { Globe, MapPin, DollarSign, Briefcase, FileText, CheckCircle, ExternalLink } from 'lucide-react';

const COUNTRY_GUIDES = [
  {
    country: 'Germany',
    flag: '🇩🇪',
    tuition: '€0 at public universities (nominal semester fee €150-€350)',
    livingCost: '€934 / month (~€11,208 / year)',
    blockedAccount: '€11,208 in a verified German Blocked Account (Expatrio, Fintiba, Coracle)',
    postStudyWorkVisa: '18-Month Job Seeking Visa (18 Monate Arbeitsplatzsuch-Visum)',
    partTimeWork: '140 full days or 280 half days per calendar year',
    language: 'English for Master\'s; German B2/C1 recommended for job market',
    topUniversities: ['TUM Munich', 'LMU Munich', 'Heidelberg University', 'RWTH Aachen', 'TU Berlin'],
    intakes: 'Winter Intake (Sept/Oct - Main) & Summer Intake (March/April)',
    officialPortal: 'https://www.study-in-germany.de'
  },
  {
    country: 'United States',
    flag: '🇺🇸',
    tuition: '$25,000 - $65,000 / year depending on public vs private',
    livingCost: '$1,200 - $2,500 / month depending on state',
    blockedAccount: 'Form I-20 proof of funds for 1 academic year (liquid bank balance)',
    postStudyWorkVisa: 'OPT (1 Year) + 24-Month STEM OPT Extension (Total 3 Years for STEM degrees)',
    partTimeWork: '20 hours/week on-campus during terms; CPT internships during summer',
    language: 'TOEFL iBT 90-100+ or IELTS 7.0+',
    topUniversities: ['MIT', 'Stanford', 'UC Berkeley', 'Harvard', 'CMU', 'Columbia'],
    intakes: 'Fall (August/Sept - Main), Spring (January), Summer',
    officialPortal: 'https://educationusa.state.gov'
  },
  {
    country: 'United Kingdom',
    flag: '🇬🇧',
    tuition: '£15,000 - £38,000 / year for international students',
    livingCost: '£1,334 / month (Inside London) or £1,023 / month (Outside London)',
    blockedAccount: 'CAS Statement + 28-day maintenance funds held in bank',
    postStudyWorkVisa: 'Graduate Route Visa (2 Years for Master\'s/UG, 3 Years for PhD)',
    partTimeWork: '20 hours/week during term-time for degree students',
    language: 'IELTS Academic 6.5 - 7.5',
    topUniversities: ['Oxford', 'Cambridge', 'Imperial College London', 'UCL', 'Edinburgh'],
    intakes: 'September/October (Main) & January/February',
    officialPortal: 'https://study-uk.britishcouncil.org'
  },
  {
    country: 'Canada',
    flag: '🇨🇦',
    tuition: 'CAD $20,000 - $48,000 / year',
    livingCost: 'CAD $1,500 - $2,200 / month',
    blockedAccount: 'GIC (Guaranteed Investment Certificate) of CAD $20,635',
    postStudyWorkVisa: 'PGWP (Post-Graduation Work Permit) up to 3 Years',
    partTimeWork: '24 hours/week off-campus during academic terms',
    language: 'IELTS Academic (minimum 6.0 in each band) or PTE / TOEFL',
    topUniversities: ['University of Toronto', 'UBC', 'McGill', 'Waterloo', 'Alberta'],
    intakes: 'Fall (September - Main), Winter (January), Spring/Summer (May)',
    officialPortal: 'https://www.educanada.ca'
  },
  {
    country: 'Singapore',
    flag: '🇸🇬',
    tuition: 'SGD $18,000 (Subsidized with MOE Grant) - $50,000 / year',
    livingCost: 'SGD $1,200 - $2,000 / month',
    blockedAccount: 'Proof of tuition + living expenses on Student Pass application',
    postStudyWorkVisa: '1-Year Long Term Visit Pass (LTVP) for job search / Employment Pass',
    partTimeWork: 'Up to 16 hours/week during term time for designated universities',
    language: 'IELTS 6.5+ or TOEFL 90+',
    topUniversities: ['NUS Singapore', 'NTU Singapore', 'SMU Singapore'],
    intakes: 'August (Main Intake) & January',
    officialPortal: 'https://www.moe.gov.sg/post-secondary'
  }
];

export default function StudyAbroadPage() {
  const [selectedCountry, setSelectedCountry] = useState('Germany');
  const guide = COUNTRY_GUIDES.find(c => c.country === selectedCountry) || COUNTRY_GUIDES[0];

  return (
    <div style={{ flex: 1, height: '100%', overflowY: 'auto', padding: '24px 32px', background: 'var(--bg-app)' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Globe size={22} color="#06b6d4" />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Study Abroad Destination Guides</h1>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Comprehensive country guidelines on tuition costs, visa regulations, living expenses, and post-study work permits.
        </p>
      </div>

      {/* Country Selection Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '24px', paddingBottom: '4px' }}>
        {COUNTRY_GUIDES.map((c) => (
          <button
            key={c.country}
            onClick={() => setSelectedCountry(c.country)}
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              background: selectedCountry === c.country ? 'var(--bg-surface-hover)' : 'var(--bg-surface)',
              border: `1px solid ${selectedCountry === c.country ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
              color: selectedCountry === c.country ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '0.88rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>{c.flag}</span>
            <span>{c.country}</span>
          </button>
        ))}
      </div>

      {/* Country Guide Card */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '28px', maxWidth: '840px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '2rem' }}>{guide.flag}</span>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>Study in {guide.country}</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Official higher education & visa summary</span>
            </div>
          </div>

          <a
            href={guide.officialPortal}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <span>Official Portal</span>
            <ExternalLink size={12} />
          </a>
        </div>

        {/* 2x2 Grid of Key Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'var(--bg-input)', padding: '14px 16px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
              💰 Tuition Fees Structure
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>{guide.tuition}</div>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '14px 16px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
              🏠 Monthly Cost of Living
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>{guide.livingCost}</div>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '14px 16px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
              🛂 Financial Proof / Blocked Account
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>{guide.blockedAccount}</div>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '14px 16px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
              🚀 Post-Study Work Permit (PSW)
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>{guide.postStudyWorkVisa}</div>
          </div>
        </div>

        {/* Additional Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <div><strong>⏱️ Part-Time Student Work:</strong> {guide.partTimeWork}</div>
          <div><strong>🗣️ Language Requirements:</strong> {guide.language}</div>
          <div><strong>📅 Academic Intakes:</strong> {guide.intakes}</div>
          <div><strong>🏛️ Top Ranked Universities:</strong> {guide.topUniversities.join(', ')}</div>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
          ⚠️ <em>Disclaimer: Immigration and visa rules are subject to change. Always consult the official embassy or consulate website for definitive legal guidance.</em>
        </div>
      </div>
    </div>
  );
}
