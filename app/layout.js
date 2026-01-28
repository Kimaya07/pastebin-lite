export const metadata = {
  title: 'Pastebin Lite',
  description: 'A simple pastebin application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}