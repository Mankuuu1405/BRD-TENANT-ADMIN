import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  // Personal Information
  const [contactPerson, setContactPerson] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");

  // Address Information
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");

  // Business Information
  const [businessName, setBusinessName] = useState("");
  const [cin, setCin] = useState("");
  const [pan, setPan] = useState("");
  const [gstin, setGstin] = useState("");
  const [usersCount, setUsersCount] = useState("");
  const [subscriptionType, setSubscriptionType] = useState("");
  const [loanProduct, setLoanProduct] = useState(""); // Added this field

  // Account Information
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [formErrors, setFormErrors] = useState({});
  const [globalError, setGlobalError] = useState(null);
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const FieldError = ({ error }) => {
    if (!error) return null;
    return <div className="mt-1 text-sm text-red-600">{error}</div>;
  };

  const validators = {
    contact_person: (v) => {
      if (!v) return "Contact person is required";
      if (v.trim().length < 3) return "Minimum 3 characters required";
      if (!/^[a-zA-Z ]+$/.test(v)) return "Only letters allowed";
      return null;
    },

    mobile_no: (v) => {
      if (!v) return "Mobile number is required";
      if (!/^[6-9]\d{9}$/.test(v)) return "Enter valid 10-digit mobile number";
      return null;
    },

    email: (v) => {
      if (!v) return "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Invalid email format";
      return null;
    },

    address: (v) => {
      if (!v) return "Address is required";
      if (v.trim().length < 10) return "Address too short";
      return null;
    },

    city: (v) => {
      if (!v) return "City is required";
      if (v.trim().length < 2) return "City name too short";
      return null;
    },

    pincode: (v) => {
      if (!v) return "Pincode is required";
      if (!/^\d{6}$/.test(v)) return "Enter valid 6-digit pincode";
      return null;
    },

    state: (v) => {
      if (!v) return "State is required";
      if (v.trim().length < 2) return "State name too short";
      return null;
    },

    country: (v) => {
      if (!v) return "Country is required";
      if (v.trim().length < 2) return "Country name too short";
      return null;
    },

    business_name: (v) => {
      if (!v) return "Business name is required";
      if (v.trim().length < 3) return "Minimum 3 characters required";
      if (!/^[a-zA-Z0-9 .&-]+$/.test(v)) return "Invalid characters used";
      return null;
    },

    cin: (v) => {
      if (!v) return "CIN is required";
      if (!/^[A-Z]{3}[0-9]{4}[A-Z]{3}[0-9]{6}$/.test(v))
        return "Invalid CIN format (e.g., ABC1234DEF567890)";
      return null;
    },

    pan: (v) => {
      if (!v) return "PAN is required";
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v))
        return "Invalid PAN format (e.g., ABCDE1234F)";
      return null;
    },

    gstin: (v) => {
      if (!v) return "GSTIN is required";
      if (
        !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]{1}[0-9A-Z]{1}[0-9]{1}$/.test(v)
      )
        return "Invalid GSTIN format";
      return null;
    },

    users_count: (v) => {
      if (!v) return "Number of users is required";
      if (isNaN(v) || parseInt(v) < 1) return "Enter a valid number of users";
      return null;
    },

    subscription_type: (v) => {
      if (!v) return "Subscription type is required";
      return null;
    },

    loan_product: (v) => {
      if (!v) return "Loan product is required";
      if (v.trim().length < 3) return "Minimum 3 characters required";
      if (!/^[a-zA-Z ]+$/.test(v)) return "Only letters allowed";
      return null;
    },

    password: (v) => {
      if (!v) return "Password is required";
      if (v.length < 8) return "Minimum 8 characters required";
      if (!/[A-Z]/.test(v)) return "At least one uppercase letter required";
      if (!/[a-z]/.test(v)) return "At least one lowercase letter required";
      if (!/\d/.test(v)) return "At least one number required";
      return null;
    },
  };

  const doSignup = async () => {
    console.log("Signup button clicked");

    setGlobalError(null);
    setStatus(null);
    setFormErrors({});
    setIsSubmitting(true);

    const errors = {};

    errors.contact_person = validators.contact_person(contactPerson);
    errors.mobile_no = validators.mobile_no(mobile);
    errors.email = validators.email(email);
    errors.address = validators.address(address);
    errors.city = validators.city(city);
    errors.pincode = validators.pincode(pincode);
    errors.state = validators.state(state);
    errors.country = validators.country(country);
    errors.business_name = validators.business_name(businessName);
    errors.cin = validators.cin(cin);
    errors.pan = validators.pan(pan);
    errors.gstin = validators.gstin(gstin);
    errors.users_count = validators.users_count(usersCount);
    errors.subscription_type = validators.subscription_type(subscriptionType);
    errors.loan_product = validators.loan_product(loanProduct); // Added this validation
    errors.password = validators.password(password);

    if (password !== confirm) {
      errors.confirm = "Passwords do not match";
    }

    // Remove null values
    Object.keys(errors).forEach(
      (key) => errors[key] === null && delete errors[key]
    );

    if (Object.keys(errors).length > 0) {
      console.log("Form validation errors:", errors);
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("Sending signup request...");
      // Modified to match first version's API call
      await axiosInstance.post("tenants/signup/", {
        business_name: businessName.trim(),
        email: email.trim().toLowerCase(),
        password,
        mobile_no: mobile,
        address: address.trim(),
        contact_person: contactPerson.trim(),
        loan_product: [loanProduct.trim()], // Added this field
      });

      console.log("Signup successful");
      setStatus("Signup successful! Redirecting to login...");

      // Modified to match first version's redirect
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("Signup error:", err);
      const data = err?.response?.data;
      if (data && typeof data === "object") {
        setFormErrors(data);
      } else {
        setGlobalError("Signup failed. Please try again.");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
        <div className="bg-white py-8 px-6 shadow-lg rounded-xl sm:rounded-lg sm:px-10">
          {/* Header */}
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center">
              <ShieldCheckIcon className="h-6 w-6 text-primary-600" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
          </div>

          {/* GLOBAL ERROR */}
          {globalError && (
            <div
              className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md"
              role="alert"
            >
              {globalError}
            </div>
          )}

          {/* SUCCESS */}
          {status && (
            <div
              className="mt-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md"
              role="alert"
            >
              {status}
            </div>
          )}

          <div className="mt-6">
            {/* Personal Information Section */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 pb-2 border-b border-gray-200">
                Personal Information
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
                {/* CONTACT PERSON */}
                <div>
                  <label
                    htmlFor="contact_person"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Contact Person
                  </label>
                  <div className="mt-1">
                    <input
                      id="contact_person"
                      name="contact_person"
                      type="text"
                      placeholder="Owner / Manager Name"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    <FieldError error={formErrors.contact_person} />
                  </div>
                </div>

                {/* MOBILE NO */}
                <div>
                  <label
                    htmlFor="mobile"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Mobile Number
                  </label>
                  <div className="mt-1">
                    <input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      maxLength={10}
                      inputMode="numeric"
                      pattern="[6-9]{1}[0-9]{9}"
                      placeholder="9876543210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    <FieldError error={formErrors.mobile_no} />
                  </div>
                </div>

                {/* EMAIL */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    <FieldError error={formErrors.email} />
                  </div>
                </div>

                {/* ADDRESS */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Address
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      placeholder="Full business address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    <FieldError error={formErrors.address} />
                  </div>
                </div>

                {/* CITY */}
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700"
                  >
                    City
                  </label>
                  <div className="mt-1">
                    <input
                      id="city"
                      name="city"
                      type="text"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    <FieldError error={formErrors.city} />
                  </div>
                </div>

                {/* PINCODE */}
                <div>
                  <label
                    htmlFor="pincode"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Pincode
                  </label>
                  <div className="mt-1">
                    <input
                      id="pincode"
                      name="pincode"
                      type="text"
                      maxLength={6}
                      inputMode="numeric"
                      placeholder="110001"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    <FieldError error={formErrors.pincode} />
                  </div>
                </div>

                {/* STATE */}
                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700"
                  >
                    State
                  </label>
                  <div className="mt-1">
                    <input
                      id="state"
                      name="state"
                      type="text"
                      placeholder="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    <FieldError error={formErrors.state} />
                  </div>
                </div>

                {/* COUNTRY */}
                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Country
                  </label>
                  <div className="mt-1">
                    <input
                      id="country"
                      name="country"
                      type="text"
                      placeholder="Country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    <FieldError error={formErrors.country} />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Information Section */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 pb-2 border-b border-gray-200">
                Business Information
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
                {/* BUSINESS NAME */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="business_name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Business Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="business_name"
                      name="business_name"
                      type="text"
                      placeholder="e.g. ABC Finance Pvt Ltd"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    <FieldError error={formErrors.business_name} />
                  </div>
                </div>

                {/* LOAN PRODUCT - Added this field to match first version */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="loan_product"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Loan Product
                  </label>
                  <div className="mt-1">
                    <input
                      id="loan_product"
                      name="loan_product"
                      type="text"
                      placeholder="e.g. Personal Loan, Micro Loan"
                      value={loanProduct}
                      onChange={(e) => setLoanProduct(e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    <FieldError error={formErrors.loan_product} />
                  </div>
                </div>

                {/* CIN, PAN, GSTIN */}
                <div>
                  <label
                    htmlFor="cin"
                    className="block text-sm font-medium text-gray-700"
                  >
                    CIN
                  </label>
                  <div className="mt-1">
                    <input
                      id="cin"
                      name="cin"
                      type="text"
                      placeholder="Corporate Identification Number"
                      value={cin}
                      onChange={(e) => setCin(e.target.value.toUpperCase())}
                      className="block w-full border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    <FieldError error={formErrors.cin} />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="pan"
                    className="block text-sm font-medium text-gray-700"
                  >
                    PAN
                  </label>
                  <div className="mt-1">
                    <input
                      id="pan"
                      name="pan"
                      type="text"
                      placeholder="Permanent Account Number"
                      value={pan}
                      onChange={(e) => setPan(e.target.value.toUpperCase())}
                      className="block w-full border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    <FieldError error={formErrors.pan} />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="gstin"
                    className="block text-sm font-medium text-gray-700"
                  >
                    GSTIN
                  </label>
                  <div className="mt-1">
                    <input
                      id="gstin"
                      name="gstin"
                      type="text"
                      placeholder="Goods and Services Tax Identification Number"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      className="block w-full border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    <FieldError error={formErrors.gstin} />
                  </div>
                </div>

                {/* USERS COUNT AND SUBSCRIPTION TYPE */}
                <div>
                  <label
                    htmlFor="users_count"
                    className="block text-sm font-medium text-gray-700"
                  >
                    No. of Users/Clients
                  </label>
                  <div className="mt-1">
                    <input
                      id="users_count"
                      name="users_count"
                      type="number"
                      min="1"
                      placeholder="Estimated number of users"
                      value={usersCount}
                      onChange={(e) => setUsersCount(e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    <FieldError error={formErrors.users_count} />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subscription_type"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Subscription Type
                  </label>
                  <div className="mt-1">
                    <select
                      id="subscription_type"
                      name="subscription_type"
                      value={subscriptionType}
                      onChange={(e) => setSubscriptionType(e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="">Select subscription type</option>
                      <option value="basic">Basic</option>
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                    <FieldError error={formErrors.subscription_type} />
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information Section */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 pb-2 border-b border-gray-200">
                Account Information
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
                {/* PASSWORD */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    <FieldError error={formErrors.password} />
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label
                    htmlFor="confirm_password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirm_password"
                      name="confirm_password"
                      type="password"
                      placeholder="Re-enter password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    <FieldError error={formErrors.confirm} />
                  </div>
                </div>
              </div>
            </div>

            {/* SIGN UP BUTTON */}
            <div className="mt-6">
              <button
                type="button"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
                onClick={doSignup}
              >
                {isSubmitting ? "Signing up..." : "Sign Up"}
              </button>
            </div>

            {/* LOGIN LINK */}
            <div className="mt-6 text-center text-sm">
              <span className="text-gray-700">Already have an account? </span>
              <button
                type="button"
                className="font-medium text-primary-600 hover:text-primary-500"
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
