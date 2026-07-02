import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getApiError } from "../../api/client.js";
import { useAuth } from "../../auth/AuthProvider.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";

export const AuthForm = ({ mode }) => {
  const isRegister = mode === "register";
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      let data;
      if (isRegister) {
        data = await signUp(form);
      } else {
        data = await signIn({ email: form.email, password: form.password });
      }
      
      const role = data.user?.role || data.role;
      if (role === "owner") {
        navigate("/owner/dashboard", { replace: true });
      } else {
        navigate(location.state?.from?.pathname || "/", { replace: true });
      }
    } catch (err) {
      setError(getApiError(err, "Authentication failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-surface lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden bg-ink px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-coral text-base font-black">R</span>
          <span className="text-lg font-bold">RoomMateAI</span>
        </div>
        <div className="max-w-xl">
          <h1 className="text-5xl font-bold leading-tight">Find PGs and roommates that fit daily life.</h1>
          <p className="mt-5 text-lg leading-8 text-white/75">
            Manage listings, save living preferences, compare compatibility, and handle booking requests from one focused workspace.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm text-white/75">
          <div className="rounded-lg bg-white/10 p-4">JWT auth</div>
          <div className="rounded-lg bg-white/10 p-4">PG booking</div>
          <div className="rounded-lg bg-white/10 p-4">Live chat</div>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md p-6 sm:p-8">
          <div className="mb-7">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-mint text-moss lg:hidden">
              {isRegister ? <UserPlus className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
            </div>
            <h1 className="text-2xl font-bold text-ink">{isRegister ? "Create account" : "Sign in"}</h1>
            <p className="mt-2 text-sm text-stone-600">
              {isRegister ? "Set up access to PGs, matches, and bookings." : "Continue to your RoomMateAI workspace."}
            </p>
          </div>

          {error ? <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

          <form className="space-y-4" onSubmit={onSubmit}>
            {isRegister ? (
              <>
                <label>
                  <span className="label">Name</span>
                  <input className="field" name="name" value={form.name} onChange={onChange} required />
                </label>
                <label>
                  <span className="label">Account Type</span>
                  <select className="field" name="role" value={form.role || "student"} onChange={onChange}>
                    <option value="student">Student (Looking for PG)</option>
                    <option value="owner">Owner (Listing PGs)</option>
                  </select>
                </label>
              </>
            ) : null}

            <label>
              <span className="label">Email</span>
              <input className="field" type="email" name="email" value={form.email} onChange={onChange} required />
            </label>

            <label>
              <span className="label">Password</span>
              <div className="relative">
                <input
                  className="field pr-11"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  minLength={4}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-stone-500 hover:bg-stone-100"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <Button className="w-full" type="submit" disabled={loading}>
              {isRegister ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              {loading ? "Please wait" : isRegister ? "Create account" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-600">
            {isRegister ? "Already have an account?" : "New to RoomMateAI?"}{" "}
            <Link className="font-semibold text-moss hover:underline" to={isRegister ? "/login" : "/register"}>
              {isRegister ? "Sign in" : "Create one"}
            </Link>
          </p>
        </Card>
      </section>
    </div>
  );
};
