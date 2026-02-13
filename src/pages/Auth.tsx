import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, Chrome } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "signup");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } else {
      const { error } = await signUp(email, password, name);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Check your email to verify your account!");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold gradient-text">AllCollegeEvent</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {isLogin ? "Welcome back!" : "Create an account"}
            </h1>
            <p className="text-muted-foreground">
              {isLogin ? "Enter your credentials to access your account" : "Join 50,000+ students and professionals"}
            </p>
          </div>

          {/* Social Login */}
          <div className="space-y-3 mb-6">
            <Button variant="outline" className="w-full h-12" type="button" disabled>
              <Chrome className="w-5 h-5 mr-2" />
              Continue with Google
            </Button>
            <Button variant="outline" className="w-full h-12" type="button" disabled>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Continue with LinkedIn
            </Button>
          </div>

          <div className="relative mb-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-sm text-muted-foreground">or</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="h-12" required />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 pl-10" required />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {isLogin && (
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 pl-10 pr-10" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button variant="hero" size="lg" className="w-full" type="submit" disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </Button>
          </form>

          {/* Toggle */}
          <p className="text-center mt-6 text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary font-semibold hover:underline">
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>

          {!isLogin && (
            <p className="text-center mt-4 text-xs text-muted-foreground">
              By creating an account, you agree to our{" "}
              <Link to="/terms" className="underline hover:text-foreground">Terms of Service</Link> and{" "}
              <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
            </p>
          )}
        </div>
      </div>

      {/* Right Side - Image/Branding */}
      <div className="hidden lg:flex flex-1 gradient-hero-bg items-center justify-center p-12">
        <div className="max-w-md text-primary-foreground text-center">
          <div className="mb-8">
            <div className="w-24 h-24 rounded-3xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Your Gateway to Amazing Events</h2>
            <p className="text-primary-foreground/80">Join workshops, hackathons, and networking events from top colleges and organizations.</p>
          </div>
          <div className="grid grid-cols-3 gap-4 p-6 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm">
            <div><div className="text-2xl font-bold">500+</div><div className="text-sm text-primary-foreground/70">Events</div></div>
            <div><div className="text-2xl font-bold">50K+</div><div className="text-sm text-primary-foreground/70">Users</div></div>
            <div><div className="text-2xl font-bold">200+</div><div className="text-sm text-primary-foreground/70">Colleges</div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
