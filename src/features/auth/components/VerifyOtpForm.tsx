import React, { useState, useEffect } from 'react';
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
import { useVerifyRegisterOtpMutation } from '../services/authApi';
import { setCredentials, setLoading, setError } from '../slices/authSlice';
import { Shield, ArrowLeft, RotateCcw } from 'lucide-react';

const VerifyOtpForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [verifyOtp, { isLoading }] = useVerifyRegisterOtpMutation();

  // Form state
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Validation function
  const validateOtp = () => {
    if (!otp) {
      setOtpError('Please enter the OTP code');
      return false;
    }
    if (otp.length !== 6) {
      setOtpError('OTP code must be 6 digits');
      return false;
    }
    if (!/^\d+$/.test(otp)) {
      setOtpError('OTP code can only contain numbers');
      return false;
    }
    setOtpError('');
    return true;
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6); // Only numbers, max 6 digits
    setOtp(value);
    // Clear error when user starts typing
    if (otpError) {
      setOtpError('');
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    // Here you would call the resend OTP API
    // For now, just reset the countdown
    setCountdown(60);
    setCanResend(false);
    toast.success('New OTP code has been sent!');
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateOtp()) {
      return;
    }

    if (!email) {
      toast.error('Email information not found. Please try again.');
      navigate('/register');
      return;
    }

    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const result = await verifyOtp({
        email,
        otp,
      }).unwrap();

      if (result.message) {
        toast.success('Verification successful! Please log in.');
        navigate('/login');
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'OTP verification failed. Please try again.';
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
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Verify OTP
        </CardTitle>
        <CardDescription className="text-gray-600">
          Verification code has been sent to email: <br />
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
                value={otp}
                onChange={handleInputChange}
                placeholder="123456"
                className="h-12 text-center text-lg font-mono tracking-widest border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                maxLength={6}
              />
            </div>
            {otpError && (
              <p className="text-sm font-medium text-red-500 mt-1">
                {otpError}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </Button>

          {/* Resend OTP */}
          <div className="text-center">
            {canResend ? (
              <Button
                type="button"
                variant="ghost"
                onClick={handleResendOtp}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Resend OTP Code
              </Button>
            ) : (
              <p className="text-sm text-gray-600">
                Resend code in {countdown} seconds
              </p>
            )}
          </div>

          <div className="text-center pt-4 space-y-2">
            <Link
              to="/register"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Register
            </Link>

            <p className="text-sm text-gray-600">
              Already have an account?{' '}
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

export default VerifyOtpForm;
