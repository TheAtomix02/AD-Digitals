import './globals.css'
export const metadata = { title: 'AD-Digitals Executive', description: 'AI Lead Generation DNA' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
