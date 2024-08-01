export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        {/* Layout UI */}
        <main>{children}</main>
      </body>
    </html>
  );
}
