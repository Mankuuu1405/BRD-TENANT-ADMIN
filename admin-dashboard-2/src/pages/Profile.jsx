import { useState, useEffect } from "react";
import {
  CameraIcon,
  UserIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    phone: "",
    department: "",
    location: "",
    bio: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: false,
    pushNotifications: false,
    smsNotifications: false,
    weeklyReports: false,
  });

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);

        // Load avatar from localStorage
        const savedAvatar = localStorage.getItem("profile_avatar");
        if (savedAvatar) {
          setAvatar(savedAvatar);
        }

        // Try to load user data from localStorage first
        const userData = localStorage.getItem("user_data");
        if (userData) {
          const parsedData = JSON.parse(userData);
          setFormData((prev) => ({
            ...prev,
            name: parsedData.name || "",
            email: parsedData.email || "",
            role: parsedData.role || "",
          }));
        }

        // Load additional profile data
        const profileData = localStorage.getItem("extended_profile_data");
        if (profileData) {
          const parsedProfileData = JSON.parse(profileData);
          setFormData((prev) => ({
            ...prev,
            phone: parsedProfileData.phone || "",
            department: parsedProfileData.department || "",
            location: parsedProfileData.location || "",
            bio: parsedProfileData.bio || "",
          }));
        }

        // Load notification settings
        const notificationData = localStorage.getItem("notification_settings");
        if (notificationData) {
          const parsedNotificationData = JSON.parse(notificationData);
          setNotificationSettings(parsedNotificationData);
        }

        // If no data in localStorage, you could fetch from an API here
        // Example:
        // const response = await fetch('/api/user/profile');
        // const data = await response.json();
        // setFormData(data);
      } catch (error) {
        console.error("Error loading profile data:", error);
        // Handle error appropriately (show error message, etc.)
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        setAvatar(result);
        localStorage.setItem("profile_avatar", result);

        // Dispatch event to notify other components
        window.dispatchEvent(new Event("profile-avatar-updated"));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    // Save basic user data to localStorage
    localStorage.setItem(
      "user_data",
      JSON.stringify({
        name: formData.name,
        email: formData.email,
        role: formData.role,
      })
    );

    // Save extended profile data
    localStorage.setItem(
      "extended_profile_data",
      JSON.stringify({
        phone: formData.phone,
        department: formData.department,
        location: formData.location,
        bio: formData.bio,
      })
    );

    setIsEditing(false);
    // Show success message (you could add a toast notification here)
    alert("Profile updated successfully!");
  };

  const handlePasswordUpdate = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New password and confirm password do not match!");
      return;
    }

    // In a real app, you would send this to your backend
    alert("Password updated successfully!");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswordSection(false);
  };

  const handleSaveNotifications = () => {
    // Save notification settings
    localStorage.setItem(
      "notification_settings",
      JSON.stringify(notificationSettings)
    );
    alert("Notification settings updated successfully!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            Profile Settings
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start">
            <div className="relative mb-4 sm:mb-0 sm:mr-6">
              <div className="h-24 w-24 rounded-full bg-primary-600 text-white flex items-center justify-center overflow-hidden">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold">
                    {formData.name
                      ? formData.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : "U"}
                  </span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md cursor-pointer hover:bg-gray-100">
                <CameraIcon className="h-5 w-5 text-gray-600" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {formData.name || "User Name"}
              </h2>
              <p className="text-gray-600">
                {formData.role || "Role not specified"}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                  Active
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Verified
                </span>
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your full name"
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                  !isEditing ? "bg-gray-50 text-gray-600" : ""
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your email"
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                  !isEditing ? "bg-gray-50 text-gray-600" : ""
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your phone number"
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                  !isEditing ? "bg-gray-50 text-gray-600" : ""
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your department"
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                  !isEditing ? "bg-gray-50 text-gray-600" : ""
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your location"
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                  !isEditing ? "bg-gray-50 text-gray-600" : ""
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your role"
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                  !isEditing ? "bg-gray-50 text-gray-600" : ""
                }`}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows={3}
              placeholder="Tell us about yourself"
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                !isEditing ? "bg-gray-50 text-gray-600" : ""
              }`}
            />
          </div>
          {isEditing && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Security Settings
          </h3>
          <div className="mb-4">
            <button
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="flex items-center text-primary-600 hover:text-primary-700"
            >
              <ShieldCheckIcon className="h-5 w-5 mr-2" />
              Change Password
            </button>
          </div>

          {showPasswordSection && (
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handlePasswordUpdate}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  Update Password
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Notification Settings
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">
                  Receive notifications via email
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={notificationSettings.emailNotifications}
                  onChange={handleNotificationChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-500">
                  Receive push notifications in browser
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="pushNotifications"
                  checked={notificationSettings.pushNotifications}
                  onChange={handleNotificationChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">SMS Notifications</p>
                <p className="text-sm text-gray-500">
                  Receive notifications via SMS
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="smsNotifications"
                  checked={notificationSettings.smsNotifications}
                  onChange={handleNotificationChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Weekly Reports</p>
                <p className="text-sm text-gray-500">
                  Receive weekly summary reports
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="weeklyReports"
                  checked={notificationSettings.weeklyReports}
                  onChange={handleNotificationChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveNotifications}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Save Notification Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
