import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';

import AuthCard from '../../components/common/AuthCard';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import authService from '../../services/authService';
import { ROUTES } from '../../utils/constants';

/**
 * ForgotPasswordPage — Request password reset.
 * Replaces card content with a success screen on submission.
 *
 * Reference: UI-Guide.md §7.4, SRS FR-03
 * Rule: Functional Component + Hooks, Tailwind only (PROJECT_RULES.md)
 */
const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setValidationError('');

    if (!email.trim()) {
      setValidationError('Email is required.');
      return;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setIsSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Something went wrong. Please try again.');
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
            <h2 className="text-h3 font-semibold text-text-primary">Check your email</h2>
            <p className="text-body-sm text-text-secondary mt-2 max-w-sm">
              We have sent password reset instructions to <strong>{email}</strong>. Please check your inbox.
            </p>
          </div>
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center gap-2 text-btn font-semibold text-primary hover:text-primary-hover mt-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter the email address associated with your account, and we will email you a link to reset your password."
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {error && <Alert variant="danger">{error}</Alert>}

        <FormField
          label="Email address"
          id="forgot-email"
          type="email"
          placeholder="you@example.com"
          required
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={validationError}
          isDisabled={isLoading}
        />

        <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
          Send reset link
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

export default ForgotPasswordPage;
