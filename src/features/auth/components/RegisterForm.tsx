import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/core/store/store';
import { useRegisterMutation } from '../services/authApi';
import { setLoading, setError, clearError } from '../slices/authSlice';
import type { RegisterFormData } from '../types/auth.types';
import {
  UserPlus,
  Mail,
  User,
  Lock,
  Calendar,
  Phone,
  MapPin,
} from 'lucide-react';

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [register] = useRegisterMutation();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    gender: '' as 'Male' | 'Female' | 'Other',
    dob: '',
    phoneNumber: '',
    address: '',
  });

  // Form errors
  const [errors, setErrors] = useState<{
    email: string;
    fullName: string;
    password: string;
    confirmPassword: string;
    gender: string;
    dob: string;
    phoneNumber: string;
    address: string;
  }>({
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    gender: '',
    dob: '',
    phoneNumber: '',
    address: '',
  });

  // Clear error when component mounts
  React.useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Validation function
  const validateForm = () => {
    const newErrors = {
      email: '',
      fullName: '',
      password: '',
      confirmPassword: '',
      gender: '',
      dob: '',
      phoneNumber: '',
      address: '',
    };

    if (!formData.email) {
      newErrors.email = 'Please enter your email address';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Please enter your full name';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }

    if (!formData.dob) {
      newErrors.dob = 'Please select your date of birth';
    } else {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13) {
        newErrors.dob = 'You must be at least 13 years old';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Please enter a password';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }; // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle select change
  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      gender: value as 'Male' | 'Female' | 'Other',
    }));

    // Clear gender error
    if (errors.gender) {
      setErrors((prev) => ({
        ...prev,
        gender: '',
      }));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const userData = {
        email: formData.email,
        fullName: formData.fullName,
        password: formData.password,
        gender: formData.gender,
        dob: formData.dob,
        phoneNumber: formData.phoneNumber || undefined,
        address: formData.address || undefined,
      };

      const result = await register(userData).unwrap();

      if (result.data) {
        toast.success(
          'Registration successful! Please check your email for verification code.'
        );
        navigate('/verify-otp', { state: { email: formData.email } });
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Registration failed. Please try again.';
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <Card className="w-full shadow-xl border-0">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
            <UserPlus className="w-7 h-7 text-white" />
          </div>
        </div>
        <CardTitle className="text-xl font-bold text-gray-900">
          Create new account
        </CardTitle>
        <CardDescription className="text-gray-600 text-sm">
          Fill in your information to create an EchoEnglish account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Email Field */}
          <div className="md:col-span-2">
            <Label htmlFor="email" className="text-gray-700">
              Email
            </Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@email.com"
                className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            {errors.email && (
              <p className="text-sm font-medium text-red-500 mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Full Name Field */}
          <div>
            <Label htmlFor="fullName" className="text-gray-700">
              Full Name
            </Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            {errors.fullName && (
              <p className="text-sm font-medium text-red-500 mt-1">
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Gender Field */}
          <div>
            <Label htmlFor="gender" className="text-gray-700">
              Gender
            </Label>
            <Select value={formData.gender} onValueChange={handleSelectChange}>
              <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 mt-1">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-sm font-medium text-red-500 mt-1">
                {errors.gender}
              </p>
            )}
          </div>

          {/* Date of Birth Field */}
          <div>
            <Label htmlFor="dob" className="text-gray-700">
              Date of Birth
            </Label>
            <div className="relative mt-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="dob"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleInputChange}
                className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            {errors.dob && (
              <p className="text-sm font-medium text-red-500 mt-1">
                {errors.dob}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <Label htmlFor="password" className="text-gray-700">
              Password
            </Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            {errors.password && (
              <p className="text-sm font-medium text-red-500 mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <Label htmlFor="confirmPassword" className="text-gray-700">
              Confirm Password
            </Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-sm font-medium text-red-500 mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Phone Number Field (Optional) */}
          <div>
            <Label htmlFor="phoneNumber" className="text-gray-700">
              Phone Number (Optional)
            </Label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="0123456789"
                className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Address Field (Optional) */}
          <div>
            <Label htmlFor="address" className="text-gray-700">
              Address (Optional)
            </Label>
            <div className="relative mt-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Main St, City, State"
                className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Submit Button - Full Width */}
          <div className="md:col-span-2 pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>

          {/* Login Link - Full Width */}
          <div className="md:col-span-2 text-center pt-2">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a
                href="/login"
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Sign in now
              </a>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
