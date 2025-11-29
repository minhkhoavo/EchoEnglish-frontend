import React, { useState, useEffect } from 'react';
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
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from '../services/authApi';
import { setUser, setLoading, setError } from '../slices/authSlice';
import { User, Mail, Calendar, Phone, MapPin, Camera } from 'lucide-react';
import { UserAvatar } from '@/components/UserAvatar';

const ProfileForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isLoading, error } = useAppSelector((state) => state.auth);
  const { data: profileData, refetch } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  // Form state with placeholders
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '' as 'Male' | 'Female' | 'Other',
    dob: '',
    email: '',
    phoneNumber: '',
    address: '',
    image: '',
  });

  // Form errors
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
  });

  // Load profile data when component mounts or data changes
  useEffect(() => {
    if (profileData?.message && profileData.data) {
      const userData = profileData.data;
      setFormData({
        fullName: userData.fullName || '',
        gender: (userData.gender as 'Male' | 'Female' | 'Other') || 'Other',
        dob: userData.dob
          ? new Date(userData.dob).toISOString().split('T')[0]
          : '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        address: userData.address || '',
        image: userData.image || '',
      });
    }
  }, [profileData]);

  // Clear error when component mounts
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(setError(null));
    }
  }, [error, dispatch]);

  // Validation function
  const validateForm = () => {
    const newErrors = {
      fullName: '',
      email: '',
    };
    let isValid = true;

    // Full name validation
    if (!formData.fullName) {
      newErrors.fullName = 'Please enter your full name';
      isValid = false;
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
      isValid = false;
    }

    // Email validation (skip since it's disabled)
    // if (!formData.email) {
    //   newErrors.email = 'Please enter your email';
    //   isValid = false;
    // } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    //   newErrors.email = 'Please enter a valid email address';
    //   isValid = false;
    // }

    setErrors(newErrors);
    return isValid;
  };

  // Handle input change
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
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const profileUpdateData = {
        fullName: formData.fullName,
        gender: formData.gender,
        dob: formData.dob || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        address: formData.address || undefined,
        image: formData.image || undefined,
      };

      const result = await updateProfile(profileUpdateData).unwrap();

      if (result.message) {
        dispatch(setUser(result.data));
        toast.success('Profile updated successfully!');
        refetch(); // Refresh profile data
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Profile update failed. Please try again.';
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  if (isLoading && !profileData) {
    return (
      <Card className="w-full shadow-xl border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Loading profile...
          </CardTitle>
          <CardDescription>
            Please wait while we load your information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-xl border-0 max-h-[90vh] overflow-y-auto scrollbar-hide">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-900">
          Personal Information
        </CardTitle>
        <CardDescription className="text-gray-600">
          Manage your profile information and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Profile Avatar */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <UserAvatar
              src={formData.image}
              alt="Profile Avatar"
              fallbackText={formData.fullName || 'U'}
              size="xl"
              ringClassName="ring-0"
            />
            <button
              type="button"
              className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          {/* Full Name Field */}
          <div className="md:col-span-2">
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
                placeholder="Enter your full name"
                className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            {errors.fullName && (
              <p className="text-sm font-medium text-red-500 mt-1">
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="md:col-span-2">
            <Label htmlFor="email" className="text-gray-700">
              Email
            </Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-gray-50 cursor-not-allowed"
                disabled
              />
            </div>
            {errors.email && (
              <p className="text-sm font-medium text-red-500 mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Gender Field */}
          <div>
            <Label htmlFor="gender" className="text-gray-700">
              Gender
            </Label>
            <Select value={formData.gender} onValueChange={handleSelectChange}>
              <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 mt-1">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
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
                className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Phone Number Field */}
          <div>
            <Label htmlFor="phoneNumber" className="text-gray-700">
              Phone Number
            </Label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
                className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Address Field */}
          <div>
            <Label htmlFor="address" className="text-gray-700">
              Address
            </Label>
            <div className="relative mt-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Main Street, City, State, ZIP"
                className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading || isUpdating}
              className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isLoading || isUpdating ? 'Updating...' : 'Update Information'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
