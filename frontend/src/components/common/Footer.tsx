/**
 * Application footer
 */

export default function Footer() {
  return (
    <footer className="bg-brand-darkGreen text-brand-cream py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="text-center flex flex-col items-center">        
          <img src="/logo.png" alt="Parsnipt Logo" className="h-10 w-auto mb-4 rounded-full opacity-80" />
          <p>&copy; 2026 Parsnipt. All rights reserved.</p>
          <p className="text-sm text-brand-cream/60 mt-2">MIT Licensed</p>
        </div>
      </div>
    </footer>
  );
}