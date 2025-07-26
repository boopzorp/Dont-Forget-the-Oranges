import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster"
import { PT_Sans, Nanum_Pen_Script } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import './globals.css';

const ptSans = PT_Sans({ 
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-sans',
})

const nanumPenScript = Nanum_Pen_Script({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-headline',
})

export const metadata: Metadata = {
  title: "Don't Forget the Oranges",
  description: 'Your personal grocery list assistant.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${ptSans.variable} ${nanumPenScript.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
