import { Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = typeof window !== 'undefined' ? window.location.hostname : 'hms-app';

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-3 text-lg font-semibold">Hospital Management System</h3>
            <p className="text-sm text-muted-foreground">
              Modern healthcare management powered by the Internet Computer.
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-lg font-semibold">Contact</h3>
            <p className="text-sm text-muted-foreground">
              Email: support@hms.example.com
              <br />
              Phone: +1 (555) 123-4567
              <br />
              Address: 123 Healthcare Ave, Medical City
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>About Us</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1">
            © {currentYear} HMS. Built with <Heart className="h-4 w-4 fill-red-500 text-red-500" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(appIdentifier)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
