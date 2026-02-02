"use client"

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import Cookies from "js-cookie";
import api from "@/lib/api";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 2. Get the Firebase ID Token
      const idToken = await user.getIdToken();

      // 3. Store the token in a cookie
      Cookies.set("token", idToken, { expires: 30 }); // 30 days
      
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found") {
        setError("Invalid email or password. Are you sure you've registered?");
      } else if (err.code === "auth/wrong-password") {
        setError("The password you entered is incorrect.");
      } else {
        setError("Something went wrong. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      // Ensure user is synced with our DB
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
      setError(err.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
        <p className="text-text-secondary">Enter your credentials to access your workspace</p>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger text-danger text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleLogin}>
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

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Password</label>
            <Link href="/forgot-password" hidden className="text-xs font-semibold text-brand-primary hover:text-brand-accent transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
            <input 
              type={showPassword ? "text" : "password"} 
              required
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
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

        <div className="flex items-center gap-2">
          <input type="checkbox" id="remember" className="w-4 h-4 rounded border-border-input bg-[#1D2029] accent-brand-primary" />
          <label htmlFor="remember" className="text-sm text-text-secondary cursor-pointer">Remember for 30 days</label>
        </div>

        <button 
          disabled={loading}
          type="submit"
          className="w-full bg-brand-primary hover:bg-brand-accent text-white font-bold py-3 rounded-md transition-all shadow-lg shadow-brand-primary/20 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="animate-spin" size={20} />}
          Sign In
        </button>
      </form>

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-main"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-bg-page px-2 text-text-tertiary font-bold tracking-widest whitespace-nowrap">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={handleGoogleLogin}
          type="button"
          disabled={loading}
          className="flex items-center justify-center gap-3 bg-[#161922] border border-border-main text-white py-3 rounded-md hover:bg-white/5 transition-all font-semibold disabled:opacity-50"
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
          Google
        </button>
        <button 
          type="button"
          disabled={loading}
          className="flex items-center justify-center gap-3 bg-[#161922] border border-border-main text-white py-3 rounded-md hover:bg-white/5 transition-all font-semibold disabled:opacity-50"
        >
          <img src="https://www.microsoft.com/favicon.ico" className="w-4 h-4" alt="Microsoft" />
          Microsoft
        </button>
      </div>

      <p className="text-center text-text-secondary text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-brand-primary font-bold hover:text-brand-accent transition-colors">
          Create account
        </Link>
      </p>
    </div>
  );
}
