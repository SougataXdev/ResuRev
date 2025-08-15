import { Link } from "react-router";

export default function Footer() {
  return (
    <footer id="footer" className="bg-card border-t py-8 md:py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">
              ResuRev
            </h3>
            <p className="text-muted-foreground mb-3 md:mb-4 text-sm md:text-base">
              AI-powered resume review tool that helps you land your dream job.
            </p>
            <div className="flex flex-wrap gap-3 md:gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary text-sm md:text-base transition-colors"
              >
                Twitter
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary text-sm md:text-base transition-colors"
              >
                LinkedIn
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary text-sm md:text-base transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 md:mb-4 text-base md:text-lg">
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/features"
                  className="text-muted-foreground hover:text-primary text-sm md:text-base transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-muted-foreground hover:text-primary text-sm md:text-base transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/reviews"
                  className="text-muted-foreground hover:text-primary text-sm md:text-base transition-colors"
                >
                  Reviews
                </Link>
              </li>
              <li>
                <Link
                  to="/updates"
                  className="text-muted-foreground hover:text-primary text-sm md:text-base transition-colors"
                >
                  Updates
                </Link>
              </li>
            </ul>
          </div>
          \
          <div>
            <h4 className="font-semibold mb-3 md:mb-4 text-base md:text-lg">
              Company
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-muted-foreground hover:text-primary text-sm md:text-base transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="text-muted-foreground hover:text-primary text-sm md:text-base transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="text-muted-foreground hover:text-primary text-sm md:text-base transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-muted-foreground hover:text-primary text-sm md:text-base transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 md:mb-4 text-base md:text-lg">
              Support
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/help"
                  className="text-muted-foreground hover:text-primary text-sm md:text-base transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-muted-foreground hover:text-primary text-sm md:text-base transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-muted-foreground hover:text-primary text-sm md:text-base transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/status"
                  className="text-muted-foreground hover:text-primary text-sm md:text-base transition-colors"
                >
                  Status
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-6 md:my-8 border-border" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <p className="text-muted-foreground text-xs md:text-sm">
            © 2025 ResuRev. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 md:gap-6">
            <Link
              to="/privacy"
              className="text-muted-foreground hover:text-primary text-xs md:text-sm transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="text-muted-foreground hover:text-primary text-xs md:text-sm transition-colors"
            >
              Terms
            </Link>
            <Link
              to="/cookies"
              className="text-muted-foreground hover:text-primary text-xs md:text-sm transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
