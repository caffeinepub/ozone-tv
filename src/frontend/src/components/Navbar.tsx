import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Crown,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";
import SignUpModal from "./SignUpModal";

const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Movies", path: "/category/Movies" },
  { label: "Short Films", path: "/category/Short Films" },
  { label: "Music Videos", path: "/category/Music Videos" },
  { label: "Kids", path: "/category/Children" },
];

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const { identity, clear } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const pendingAdminRedirect = useRef(false);

  const handleSignUpClose = () => {
    setShowSignUp(false);
    pendingAdminRedirect.current = true;
  };

  useEffect(() => {
    if (pendingAdminRedirect.current && isAdmin !== undefined) {
      pendingAdminRedirect.current = false;
      if (isAdmin) {
        navigate({ to: "/admin" });
      }
    }
  }, [isAdmin, navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/search", search: { q: searchQuery } as never });
      setSearchOpen(false);
    }
  };

  return (
    <>
      {showSignUp && <SignUpModal onClose={handleSignUpClose} />}

      <header className="fixed top-0 left-0 right-0 z-50 transition-all">
        <div
          className="absolute inset-0 bg-gradient-to-b from-background/95 to-background/0"
          style={{ backdropFilter: "blur(8px)" }}
        />
        <nav className="relative flex items-center gap-4 px-4 md:px-8 h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center flex-shrink-0 mr-6"
            data-ocid="nav.link"
          >
            <img
              src="/assets/generated/ozone-tv-logo-transparent.dim_512x512.png"
              alt="Ozone TV"
              className="h-10 w-auto object-contain"
              style={{
                maxWidth: "160px",
                filter:
                  "brightness(1.9) contrast(1.2) saturate(1.1) drop-shadow(0 0 6px rgba(120,80,255,0.35))",
              }}
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-0.5 flex-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path as "/"}
                className={`px-3 py-1.5 rounded-md text-sm font-medium tracking-wide font-body transition-colors ${
                  currentPath === link.path
                    ? "text-foreground bg-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                data-ocid="nav.link"
              >
                {link.label}
              </Link>
            ))}

            {isAdmin && (
              <Link
                to="/admin"
                className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold font-display tracking-widest bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 hover:border-primary/50 transition-all"
                data-ocid="nav.admin.link"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                ADMIN
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Search */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <Input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search videos..."
                  className="w-48 md:w-64 h-8 bg-muted/50 border-border text-sm font-body"
                  data-ocid="nav.search_input"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground"
                  onClick={() => setSearchOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </form>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setSearchOpen(true)}
                data-ocid="nav.button"
              >
                <Search className="w-4 h-4" />
              </Button>
            )}

            {/* User menu or Sign In */}
            {identity ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground"
                    data-ocid="nav.dropdown_menu"
                  >
                    <User className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 bg-card border-border"
                >
                  <DropdownMenuItem asChild>
                    <Link
                      to="/profile"
                      className="cursor-pointer font-body"
                      data-ocid="nav.profile.link"
                    >
                      <User className="w-4 h-4 mr-2" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/subscribe"
                      className="cursor-pointer font-body"
                      data-ocid="nav.subscribe.link"
                    >
                      <Crown className="w-4 h-4 mr-2" /> Subscribe
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          to="/admin"
                          className="cursor-pointer font-body"
                          data-ocid="nav.admin.link"
                        >
                          <Settings className="w-4 h-4 mr-2" /> Admin
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={clear}
                    className="text-destructive cursor-pointer font-body"
                    data-ocid="nav.logout.button"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-sm font-display text-xs tracking-widest"
                onClick={() => setShowSignUp(true)}
                data-ocid="nav.primary_button"
              >
                Sign In
              </Button>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-muted-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
              data-ocid="nav.toggle"
            >
              {mobileOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </Button>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-card/95 border-b border-border px-4 pb-4 backdrop-blur-md">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path as "/"}
                className="block py-2.5 text-sm font-medium font-body text-muted-foreground hover:text-foreground"
                onClick={() => setMobileOpen(false)}
                data-ocid="nav.link"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-2 py-2.5 text-xs font-semibold font-display tracking-widest text-primary"
                onClick={() => setMobileOpen(false)}
                data-ocid="nav.admin.link"
              >
                <ShieldCheck className="w-4 h-4" />
                ADMIN
              </Link>
            )}
          </div>
        )}
      </header>
    </>
  );
}
