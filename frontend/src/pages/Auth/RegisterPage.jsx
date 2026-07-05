import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

import AuthCard from '../../components/common/AuthCard';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../utils/constants';

/**
 * RegisterPage — Sign up interface.
 * Includes password strength validation meter.
 *
 * Reference: UI-Guide.md §7.3, SRS FR-01
 * Rule: Functional Component + Hooks, Tailwind only (PROJECT_RULES.md)
 */
const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // ── Form States ────────────────────────────────────────────────────────────
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ── Password Strength States ──────────────────────────────────────────────
  const [pwdStrength, setPwdStrength] = useState({ score: 0, label: 'Weak', color: 'bg-danger' });

  // ── UI States ──────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  // ── Calculate Password Strength ────────────────────────────────────────────
  useEffect(() => {
    if (!password) {
      setPwdStrength({ score: 0, label: 'Weak', color: 'bg-border-strong' });
      return;
    }

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    let label = 'Weak';
    let color = 'bg-danger';

    if (score >= 4) {
      label = 'Strong';
      color = 'bg-success';
    } else if (score >= 2) {
      label = 'Medium';
      color = 'bg-warning';
    }

    setPwdStrength({ score, label, color });
  }, [password]);

  // ── Client-side Validation ─────────────────────────────────────────────────
  const validateForm = () => {
    const errors = {};
    if (!fullName.trim()) {
      errors.fullName = 'Full name is required.';
    } else if (fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters.';
    }

    if (!email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    } else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      errors.password = 'Password must contain uppercase, lowercase, and numeric characters.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
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
      await register({ fullName, email, password });
      toast.success('Registration successful! Welcome aboard!');
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      const responseData = err.response?.data;
      if (responseData?.error?.code === 'VALIDATION_ERROR' && responseData.error.details) {
        const fieldErrors = {};
        responseData.error.details.forEach((detail) => {
          fieldErrors[detail.field] = detail.message;
        });
        setValidationErrors(fieldErrors);
      } else {
        setFormError(
          responseData?.error?.message || 'An error occurred during registration. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title="Create your free account" subtitle="Start getting professional recruiter feedback.">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {formError && <Alert variant="danger">{formError}</Alert>}

        <FormField
          label="Full name"
          id="reg-fullname"
          placeholder="Riya Sharma"
          required
          icon={User}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={validationErrors.fullName}
          isDisabled={isLoading}
        />

        <FormField
          label="Email address"
          id="reg-email"
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
            id="reg-password"
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
          {/* Password strength meter bar */}
          {password && (
            <div className="mt-2 flex flex-col gap-1">
              <div className="flex h-1 gap-1 rounded-full bg-surface-alt overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-full flex-1 transition-colors duration-350 ${
                      i < pwdStrength.score ? pwdStrength.color : 'bg-border-strong'
                    }`}
                  />
                ))}
              </div>
              <span className="text-caption text-text-secondary select-none">
                Password strength: <strong className="text-text-primary font-semibold">{pwdStrength.label}</strong>
              </span>
            </div>
          )}
        </div>

        <FormField
          label="Confirm password"
          id="reg-confirmpassword"
          type="password"
          placeholder="••••••••"
          required
          icon={Lock}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={validationErrors.confirmPassword}
          isDisabled={isLoading}
        />

        <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
          Create account
        </Button>

        <p className="text-body-sm text-center text-text-secondary mt-2">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="font-semibold text-primary hover:text-primary-hover">
            Sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
};

export default RegisterPage;
