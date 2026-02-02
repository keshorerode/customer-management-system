"use client"

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Eye, EyeOff, Globe, Loader2, CheckCircle2, Circle } from "lucide-react";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import api from "@/lib/api";
import axios from "axios";
import Cookies from "js-cookie";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Password Validation State
  const [validation, setValidation] = useState({
    minLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false,
  });

  useEffect(() => {
    setValidation({
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);

  const isPasswordValid = Object.values(validation).every(Boolean);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) return;
    
    setLoading(true);
    setError("");

    try {
      // 1. Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 2. Get the Firebase ID Token
      const idToken = await user.getIdToken();

      // 3. Sync user data with our backend (MongoDB)
      await api.post("/auth/signup/firebase", {
        first_name: firstName,
        last_name: lastName,
        email,
        firebase_id_token: idToken
      });

      router.push("/login?signup=success");
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || "Something went wrong during sync.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      // Split name if possible
      const nameParts = (user.displayName || "").split(" ");
      const fName = nameParts[0] || "User";
      const lName = nameParts.slice(1).join(" ") || "";

      await api.post("/auth/signup/firebase", {
        first_name: fName,
        last_name: lName,
        email: user.email,
        firebase_id_token: idToken
      });

      Cookies.set("token", idToken, { expires: 30 });
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Google signup failed");
    } finally {
      setLoading(false);
    }
  };

  const ValidationItem = ({ label, met }: { label: string; met: boolean }) => (
    <div className={`flex items-center gap-2 text-xs font-semibold transition-colors ${met ? 'text-success' : 'text-text-tertiary'}`}>
      {met ? <CheckCircle2 size={14} /> : <Circle size={14} className="opacity-20" />}
      <span>{label}</span>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Create workspace</h2>
        <p className="text-text-secondary">Start managing your relationships like a pro</p>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger text-danger text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSignup}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">First Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
              <input 
                type="text" 
                required
                id="firstName"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Alex" 
                className="w-full bg-[#1D2029] border border-border-input text-white pl-10 pr-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Last Name</label>
            <input 
              type="text" 
              required
              id="lastName"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Rivera" 
              className="w-full bg-[#1D2029] border border-border-input text-white px-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
            <input 
              type="email" 
              required
              id="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@company.com" 
              className="w-full bg-[#1D2029] border border-border-input text-white pl-10 pr-4 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••" 
                className="w-full bg-[#1D2029] border border-border-input text-white pl-10 pr-12 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Password Validation Checklist */}
          {password.length > 0 && (
            <div className="bg-bg-surface border border-border-main p-4 rounded-lg space-y-3 animate-in zoom-in-95 duration-200">
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                <ValidationItem label="8+ Characters" met={validation.minLength} />
                <ValidationItem label="Uppercase" met={validation.hasUpper} />
                <ValidationItem label="Lowercase" met={validation.hasLower} />
                <ValidationItem label="Number" met={validation.hasNumber} />
                <ValidationItem label="Special Symbol" met={validation.hasSpecial} />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Country</label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
            <select className="w-full bg-[#1D2029] border border-border-input text-white pl-10 pr-4 py-3 rounded-md focus:outline-none focus:border-brand-primary appearance-none cursor-pointer">
              <option value="in">India (₹)</option>
              <option value="us">United States ($)</option>
              <option value="uk">United Kingdom (£)</option>
            </select>
          </div>
        </div>

        <button 
          disabled={loading || (!isPasswordValid && password.length > 0)}
          type="submit"
          className="w-full bg-brand-primary hover:bg-brand-accent text-white font-bold py-3 rounded-md transition-all shadow-lg shadow-brand-primary/20 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="animate-spin" size={20} />}
          Create Account
        </button>
      </form>

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-main"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-bg-page px-4 text-text-tertiary font-bold tracking-widest whitespace-nowrap">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={handleGoogleSignup}
          disabled={loading}
          className="flex items-center justify-center gap-3 bg-[#161922] border border-border-main text-white py-3 rounded-md hover:bg-white/5 transition-all font-semibold disabled:opacity-50"
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
          Google
        </button>
        <button 
          disabled={loading}
          className="flex items-center justify-center gap-3 bg-[#161922] border border-border-main text-white py-3 rounded-md hover:bg-white/5 transition-all font-semibold disabled:opacity-50"
        >
          <img src="https://www.microsoft.com/favicon.ico" className="w-4 h-4" alt="Microsoft" />
          Microsoft
        </button>
      </div>

      <p className="text-center text-text-secondary text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-primary font-bold hover:text-brand-accent transition-colors">
          Sign In
        </Link>
      </p>
    </div>
  );
}
