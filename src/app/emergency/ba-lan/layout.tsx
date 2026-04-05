// EMERGENCY CARD LAYOUT — minimal wrapper, no Nav, no UserProvider
// This page is public — accessible without login by ER staff scanning a QR code

export default function EmergencyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
