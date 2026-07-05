import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

import AuthCard from '../../components/common/AuthCard';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import authService from '../../services/authService';
import { ROUTES } from '../../utils/constants';

/**
 * ResetPasswordPage — Reset password with token from link.
 *
 * Reference: UI-Guide.md §7.4, SRS FR-03
 * Rule: Functional Component + Hooks, Tailwind only (PROJECT_RULES.md)
 */
const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  // ── Form States ────────────────────────────────────────────────────────────
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ── UI States ──────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  // ── Client-side Validation ─────────────────────────────────────────────────
  const validateForm = () => {
    const errors = {};
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await authService.resetPassword(token, password);
      toast.success('Password reset successfully!');
      setIsSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Token is invalid or has expired. Please request a new link.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthCard>
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-light">
            <CheckCircle className="h-6 w-6 text-success" />
          </div>
          <div>
            <h2 className="text-h3 font-semibold text-text-primary">Password reset complete</h2>
            <p className="text-body-sm text-text-secondary mt-2 max-w-sm">
              Your password has been successfully updated. You can now log in with your new password.
            </p>
          </div>
          <Link
            to={ROUTES.LOGIN}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-btn font-semibold text-white hover:bg-primary-hover mt-4"
          >
            Sign in
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create new password"
      subtitle="Your new password must be different from previously used passwords."
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {error && <Alert variant="danger">{error}</Alert>}

        <FormField
          label="New password"
          id="reset-password"
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

        <FormField
          label="Confirm new password"
          id="reset-confirmpassword"
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
          Reset password
        </Button>

        <div className="text-center mt-2">
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center gap-2 text-body-sm font-semibold text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </form>
    </AuthCard>
  );
};

export default ResetPasswordPage;
