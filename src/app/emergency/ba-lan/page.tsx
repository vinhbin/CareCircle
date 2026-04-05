// EMERGENCY MEDICAL CARD — Bà Lan Nguyen
// Hardcoded patient data for hackathon demo
// Clinical ER-optimized design: high contrast, large type, print-friendly
// Accessible without login — QR code scanned by hospital staff

'use client'

import { Phone, Printer, AlertTriangle, Heart, Globe, Pill, User, Stethoscope } from 'lucide-react'

const PATIENT = {
  name: 'Lan Nguyen (Bà Lan)',
  age: 70,
  diagnosis: 'Type 2 Diabetes, Hypertension',
  primaryLanguage: 'Vietnamese (Tiếng Việt)',
  allergies: ['Sulfa drugs', 'Shellfish'],
  medications: [
    { name: 'Metformin', dosage: '1000mg', frequency: '2x daily', purpose: 'Blood sugar control' },
    { name: 'Lisinopril', dosage: '20mg', frequency: '1x daily', purpose: 'Blood pressure' },
    { name: 'Glipizide', dosage: '10mg', frequency: '1x daily', purpose: 'Blood sugar control' },
    { name: 'Amlodipine', dosage: '5mg', frequency: '1x daily', purpose: 'Blood pressure' },
  ],
  emergencyContact: { name: 'Minh Nguyen', relationship: 'Son', phone: '(404) 555-0142' },
  primaryDoctor: { name: 'Dr. Sarah Chen', specialty: 'Endocrinology', phone: '(404) 555-0198' },
}

export default function EmergencyCardPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Print-friendly styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      {/* Header */}
      <header className="bg-[#DC2626] text-white px-6 py-5 print:py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Heart className="w-8 h-8 shrink-0" fill="white" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">EMERGENCY MEDICAL INFORMATION</h1>
            <p className="text-red-100 text-sm mt-0.5">CareCircle Emergency Card</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-6 space-y-5">
        {/* Patient Info */}
        <section className="border-2 border-zinc-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-zinc-600" />
            <h2 className="text-lg font-bold text-zinc-800">Patient</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 text-[15px]">
            <div>
              <span className="text-zinc-500 text-sm">Name</span>
              <p className="font-semibold text-zinc-900">{PATIENT.name}</p>
            </div>
            <div>
              <span className="text-zinc-500 text-sm">Age</span>
              <p className="font-semibold text-zinc-900">{PATIENT.age} years old</p>
            </div>
            <div className="col-span-2">
              <span className="text-zinc-500 text-sm">Diagnosis</span>
              <p className="font-semibold text-zinc-900">{PATIENT.diagnosis}</p>
            </div>
          </div>
        </section>

        {/* Primary Language — prominent */}
        <section className="border-2 border-blue-300 bg-blue-50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-blue-900">Primary Language</h2>
          </div>
          <p className="text-2xl font-bold text-blue-800">{PATIENT.primaryLanguage}</p>
          <p className="text-sm text-blue-600 mt-1">Please provide a Vietnamese interpreter. Patient does not speak English.</p>
        </section>

        {/* Allergies — red highlight */}
        <section className="border-2 border-red-300 bg-red-50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-bold text-red-800">Allergies</h2>
          </div>
          <div className="flex gap-2">
            {PATIENT.allergies.map(allergy => (
              <span key={allergy} className="px-3 py-1.5 bg-red-100 text-red-800 font-bold rounded-lg text-[15px] border border-red-200">
                {allergy}
              </span>
            ))}
          </div>
        </section>

        {/* Active Medications — table */}
        <section className="border-2 border-zinc-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Pill className="w-5 h-5 text-zinc-600" />
            <h2 className="text-lg font-bold text-zinc-800">Active Medications</h2>
          </div>
          <table className="w-full text-[14px]">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-zinc-500">
                <th className="pb-2 font-medium">Medication</th>
                <th className="pb-2 font-medium">Dosage</th>
                <th className="pb-2 font-medium">Frequency</th>
                <th className="pb-2 font-medium">Purpose</th>
              </tr>
            </thead>
            <tbody>
              {PATIENT.medications.map(med => (
                <tr key={med.name} className="border-b border-zinc-100 last:border-0">
                  <td className="py-2.5 font-semibold text-zinc-900">{med.name}</td>
                  <td className="py-2.5 text-zinc-700">{med.dosage}</td>
                  <td className="py-2.5 text-zinc-700">{med.frequency}</td>
                  <td className="py-2.5 text-zinc-500">{med.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Contacts — 2 column */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <section className="border-2 border-zinc-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Phone className="w-5 h-5 text-zinc-600" />
              <h2 className="text-lg font-bold text-zinc-800">Emergency Contact</h2>
            </div>
            <p className="font-semibold text-zinc-900 text-[15px]">{PATIENT.emergencyContact.name}</p>
            <p className="text-sm text-zinc-500">{PATIENT.emergencyContact.relationship}</p>
            <a href={`tel:${PATIENT.emergencyContact.phone}`} className="mt-2 inline-block text-[15px] font-semibold text-blue-700 underline">
              {PATIENT.emergencyContact.phone}
            </a>
          </section>

          <section className="border-2 border-zinc-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Stethoscope className="w-5 h-5 text-zinc-600" />
              <h2 className="text-lg font-bold text-zinc-800">Primary Doctor</h2>
            </div>
            <p className="font-semibold text-zinc-900 text-[15px]">{PATIENT.primaryDoctor.name}</p>
            <p className="text-sm text-zinc-500">{PATIENT.primaryDoctor.specialty}</p>
            <a href={`tel:${PATIENT.primaryDoctor.phone}`} className="mt-2 inline-block text-[15px] font-semibold text-blue-700 underline">
              {PATIENT.primaryDoctor.phone}
            </a>
          </section>
        </div>

        {/* Print button */}
        <div className="no-print flex justify-center pt-2 pb-4">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 text-white rounded-lg font-medium hover:bg-zinc-700 active:scale-95 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print this card
          </button>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-zinc-400 pb-6">
          Generated by CareCircle &middot; For emergency use only
        </footer>
      </main>
    </div>
  )
}
