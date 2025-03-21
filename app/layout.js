// app/layout.js
import './styles/globals.css';

export const metadata = {
  title: 'Persona - AI Avatar Generator',
  description: 'Generate AI avatars with a minimalist interface.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}