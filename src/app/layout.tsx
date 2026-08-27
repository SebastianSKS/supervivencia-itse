import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Supervivencia ITSE — El foro de los veteranos',
  description:
    'Consejos de alumnos veteranos del ITSE para sobrevivir el primer semestre. Comunidad, experiencia y sabiduría colectiva.',
  keywords: ['ITSE', 'consejos', 'primer semestre', 'foro', 'estudiantes'],
  authors: [{ name: 'Comunidad ITSE' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
