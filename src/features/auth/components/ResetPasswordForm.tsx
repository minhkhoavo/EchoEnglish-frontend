import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAppDispatch } from '@/core/store/store';
import { useResetPasswordMutation } from '../services/authApi';
import { setLoading, setError } from '../slices/authSlice';
import { Lock, Eye, EyeOff, ArrowLeft, KeyRound } from 'lucide-react';

const ResetPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Form errors
  const [errors, setErrors] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Validation function
  const validateForm = () => {
    const newErrors = {
      otp: '',
      newPassword: '',
      confirmPassword: '',
    };
    let isValid = true;

    // OTP validation
    if (!formData.otp) {
      newErrors.otp = 'Please enter the OTP code';
      isValid = false;
    } else if (formData.otp.length !== 6) {
      newErrors.otp = 'OTP code must be 6 digits';
      isValid = false;
    } else if (!/^\d+$/.test(formData.otp)) {
      newErrors.otp = 'OTP code can only contain numbers';
      isValid = false;
    }

    // New password validation
    if (!formData.newPassword) {
      newErrors.newPassword = 'Please enter a new password';
      isValid = false;
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
      isValid = false;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Special handling for OTP field
    const newValue =
      name === 'otp' ? value.replace(/\D/g, '').slice(0, 6) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!email) {
      toast.error('Email information not found. Please try again.');
      navigate('/forgot-password');
      return;
    }

    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const result = await resetPassword({
        email,
        otp: formData.otp,
        newPassword: formData.newPassword,
      }).unwrap();

      if (result.message) {
        toast.success(
          'Password reset successful! Please log in with your new password.'
        );
        navigate('/login');
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Password reset failed. Please try again.';
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <Card className="w-full shadow-xl border-0">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-full flex items-center justify-center">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Reset Password
        </CardTitle>
        <CardDescription className="text-gray-600">
          Enter the OTP code and new password for email: <br />
          <span className="font-medium text-gray-900">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* OTP Field */}
          <div>
            <Label htmlFor="otp" className="text-gray-700">
              OTP Code (6 digits)
            </Label>
            <div className="mt-1">
              <Input
                id="otp"
                name="otp"
                type="text"
                value={formData.otp}
                onChange={handleInputChange}
                placeholder="123456"
                className="h-12 text-center text-lg font-mono tracking-widest border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                maxLength={6}
              />
            </div>
            {errors.otp && (
              <p className="text-sm font-medium text-red-500 mt-1">
                {errors.otp}
              </p>
            )}
          </div>

          {/* New Password Field */}
          <div>
            <Label htmlFor="newPassword" className="text-gray-700">
              New Password
            </Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="newPassword"
                name="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-1/2 -translate-y-1/2 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            {errors.newPassword && (
              <p className="text-sm font-medium text-red-500 mt-1">
                {errors.newPassword}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <Label htmlFor="confirmPassword" className="text-gray-700">
              Confirm New Password
            </Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-1/2 -translate-y-1/2 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm font-medium text-red-500 mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>

          <div className="text-center pt-4 space-y-2">
            <Link
              to="/forgot-password"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Forgot Password
            </Link>

            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Sign in now
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ResetPasswordForm;
