import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GraduationCap, LogIn, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

// Google "G" SVG logo
const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="w-5 h-5 shrink-0" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    <path fill="none" d="M0 0h48v48H0z" />
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, isLoading } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      await login(email, password);
    } catch (error) {
      // Error is handled in the AuthContext
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    // Use the base URL from env, ensuring we don't accidentally double /api
    const baseUrl = import.meta.env.VITE_API_BASE_URL
      ? import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '')
      : "http://localhost:5000";

    window.location.href = `${baseUrl}/api/auth/google`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px]" />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-primary-foreground/60 hover:text-primary-foreground/90 mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </motion.div>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <motion.div
              whileHover={{ rotate: 10 }}
              className="w-12 h-12 rounded-2xl bg-primary-foreground/10 backdrop-blur-xl border border-primary-foreground/10 flex items-center justify-center"
            >
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-primary-foreground leading-tight tracking-tight">NoDues MITS</span>
              <span className="text-[11px] text-primary-foreground/50 leading-tight tracking-widest uppercase">Gwalior</span>
            </div>
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="shadow-elevated border-border/30 bg-card/95 backdrop-blur-xl">
              <CardHeader className="pb-2 pt-8 px-8 text-center">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Welcome Back</h1>
                <p className="text-sm text-muted-foreground mt-1">Sign in to your No Dues portal</p>
              </CardHeader>
              <CardContent className="px-8 pb-8 pt-4">

                {/* ── Email / Password Form ─────────────────────────── */}
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@mitsgwalior.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                      <a href="#" className="text-xs text-accent hover:underline">Forgot password?</a>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-11 gap-2 font-semibold text-base" disabled={isLoading || googleLoading}>
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                      />
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        Sign In
                      </>
                    )}
                  </Button>
                </form>

                {/* ── Divider ──────────────────────────────────────── */}
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-3 text-xs text-muted-foreground select-none">or</span>
                  </div>
                </div>

                {/* ── Google Login Button ───────────────────────────── */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <button
                    type="button"
                    id="google-login-btn"
                    onClick={handleGoogleLogin}
                    disabled={googleLoading || isLoading}
                    className="w-full h-11 flex items-center justify-center gap-3 rounded-lg border border-border bg-background hover:bg-muted/60 active:scale-[0.98] transition-all duration-150 text-sm font-medium text-foreground shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {googleLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                        className="w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full"
                      />
                    ) : (
                      <GoogleIcon />
                    )}
                    <span>{googleLoading ? "Redirecting…" : "Continue with Google"}</span>
                  </button>
                </motion.div>

                <div className="mt-6 pt-5 border-t border-border">
                  <p className="text-center text-xs text-muted-foreground">
                    Having trouble logging in? Contact{" "}
                    <a href="#" className="text-accent font-medium hover:underline">IT Support</a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-xs text-primary-foreground/40 mt-6"
          >
            © {new Date().getFullYear()} MITS Gwalior — Secure Portal
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default Login;
