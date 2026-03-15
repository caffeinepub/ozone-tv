import { Heart, Tv } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="mt-16 border-t border-border bg-card/30">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <Tv className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">
              ozone<span className="text-primary">tv</span>
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <a href="/" className="hover:text-foreground transition-colors">
              Home
            </a>
            <a
              href="/category/Movies"
              className="hover:text-foreground transition-colors"
            >
              Movies
            </a>
            <a
              href="/category/Short Films"
              className="hover:text-foreground transition-colors"
            >
              Short Films
            </a>
            <a
              href="/subscribe"
              className="hover:text-foreground transition-colors"
            >
              Subscribe
            </a>
          </div>

          <p className="text-xs text-muted-foreground flex items-center gap-1">
            © {year}. Built with{" "}
            <Heart className="w-3 h-3 text-primary" fill="currentColor" /> using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors underline underline-offset-2"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
