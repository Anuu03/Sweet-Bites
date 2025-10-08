import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { HiOutlineUser, HiOutlinePhone, HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';

const AccountDetails = () => {
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      // Allow only digits
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length <= 10) {
        setFormData({ ...formData, phone: cleaned });
      }

      // Validate Indian phone number
      if (cleaned && !/^[6-9]\d{9}$/.test(cleaned)) {
        setPhoneError('Enter a valid 10-digit Indian number starting with 6-9');
      } else {
        setPhoneError('');
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    // Final validation before submit
    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) {
      setError('Please enter a valid 10-digit Indian phone number.');
      setLoading(false);
      return;
    }

    try {
      if (showPasswordChange) {
        if (!formData.currentPassword) {
          setError('Current password is required');
          setLoading(false);
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          setError('New passwords do not match');
          setLoading(false);
          return;
        }
        if (formData.newPassword.length < 6) {
          setError('New password must be at least 6 characters long');
          setLoading(false);
          return;
        }
      }

      const token = localStorage.getItem('userToken');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      };

      if (showPasswordChange && formData.newPassword) {
        updateData.password = formData.newPassword;
      }

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/profile`,
        updateData,
        config
      );

      localStorage.setItem('userInfo', JSON.stringify(response.data));

      setMessage('Profile updated successfully!');
      setShowPasswordChange(false);
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    }

    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        setLoading(true);
        const token = localStorage.getItem('userToken');
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/profile`,
          config
        );

        localStorage.removeItem('userInfo');
        localStorage.removeItem('userToken');
        window.location.href = '/';
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete account');
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 border border-amber-100 transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <HiOutlineUser className="text-amber-600" />
        Account Details
      </h2>

      {/* Success & Error Messages with fade animation */}
      {message && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in-down">
          <p className="text-green-700 font-medium">{message}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in-down">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">
        {/* Name */}
        <div className="transition-transform duration-300 hover:scale-[1.01]">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <HiOutlineUser className="text-amber-500" /> Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            required
          />
        </div>

        {/* Email */}
        <div className="transition-transform duration-300 hover:scale-[1.01]">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <HiOutlineMail className="text-amber-500" /> Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            required
          />
        </div>

        {/* Phone */}
        <div className="transition-transform duration-300 hover:scale-[1.01]">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <HiOutlinePhone className="text-amber-500" /> Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
              phoneError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-amber-500'
            }`}
            placeholder="Enter your 10-digit number"
          />
          {phoneError && <p className="text-red-500 text-sm mt-1 animate-pulse">{phoneError}</p>}
        </div>

        {/* Password Section */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-1">
              <HiOutlineLockClosed className="text-amber-600" /> Change Password
            </h3>
            <button
              type="button"
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              className="text-amber-600 hover:text-amber-700 text-sm font-medium transition"
            >
              {showPasswordChange ? 'Cancel' : 'Change Password'}
            </button>
          </div>

          {showPasswordChange && (
            <div className="space-y-4 animate-fade-in-up">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required={showPasswordChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required={showPasswordChange}
                  minLength="6"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required={showPasswordChange}
                  minLength="6"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
          <button
            type="submit"
            disabled={loading}
            className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>

          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={loading}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            Delete Account
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountDetails;
