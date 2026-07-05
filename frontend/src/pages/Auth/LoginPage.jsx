import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

import AuthCard from '../../components/common/AuthCard';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../utils/constants';

/**
 * LoginPage — Authenticates returning users.
 *
 * Reference: UI-Guide.md §7.2, SRS FR-02
 * Rule: Functional Component + Hooks, Tailwind only (PROJECT_RULES.md)
 */
const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ── Form States ────────────────────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ── UI States ──────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // ── Redirect Destination ───────────────────────────────────────────────────
  const from = location.state?.from || ROUTES.DASHBOARD;

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  // ── Client-side Validation ─────────────────────────────────────────────────
  const validateForm = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Handle Submit ──────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await login({ email, password });
      toast.success('Logged in successfully!');
      navigate(from, { replace: true });
    } catch (err) {
      const responseData = err.response?.data;
      if (responseData?.error?.code === 'VALIDATION_ERROR' && responseData.error.details) {
        // Map backend express-validator errors to fields
        const fieldErrors = {};
        responseData.error.details.forEach((detail) => {
          fieldErrors[detail.field] = detail.message;
        });
        setValidationErrors(fieldErrors);
      } else {
        setFormError(
          responseData?.error?.message || 'Invalid email or password. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title="Sign in to your account" subtitle="Welcome back! Please enter your details.">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {formError && <Alert variant="danger">{formError}</Alert>}

        <FormField
          label="Email address"
          id="login-email"
          type="email"
          placeholder="you@example.com"
          required
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={validationErrors.email}
          isDisabled={isLoading}
        />

        <div>
          <FormField
            label="Password"
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            required
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={validationErrors.password}
            isDisabled={isLoading}
            rightElement={
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-icon-default hover:text-text-primary focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
          <div className="flex justify-end mt-1">
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="text-caption font-medium text-primary hover:text-primary-hover"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
          Sign in
        </Button>

        <p className="text-body-sm text-center text-text-secondary mt-2">
          Don&apos;t have an account?{' '}
          <Link to={ROUTES.REGISTER} className="font-semibold text-primary hover:text-primary-hover">
            Sign up for free
          </Link>
        </p>
      </form>
    </AuthCard>
  );
};

export default LoginPage;
