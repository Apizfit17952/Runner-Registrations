"use client";

import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { BambooFrame } from "@/components/ui/bamboo-frame";
import { useRegistrationStore } from "@/store/useRegistration";
import { RenderField } from "@/components/render-field";
import { occupations } from "@/src/data/occupations";
import { fetchAddressFromPincode } from "@/services/pincodeService";
import { toast } from "react-hot-toast";
import { getCountries } from "@/src/data/locations";
import { validateName } from "@/utils/validation";
import { validatePostalCode, getPostalCodeFormat } from "@/utils/postalCodes";
import { bloodGroups } from "@/src/data/bloodGroups";
import { debounce } from "@/utils/debounce";

interface PersonalInformationFormProps {
  prevStep: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

const PersonalInformationForm: React.FC<PersonalInformationFormProps> = ({ prevStep, handleSubmit }) => {
  const { form: formData, handleChange, setForm } = useRegistrationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [icError, setIcError] = useState<string | null>(null);
  const [isCheckingIc, setIsCheckingIc] = useState(false);

  const validateMobile = (mobile: string) => {
    return /^[6-9]\d{9}$/.test(mobile);
  };

  const checkIcNumber = async (icNumber: string) => {
    if (!icNumber || icNumber.length !== 12) return false;
    
    try {
      setIsCheckingIc(true);
      const response = await fetch('/api/check-ic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ icNumber }),
      });
      
      const data = await response.json();
      
      if (data.exists) {
        setIcError('This IC number is already registered');
        return false;
      }
      
      setIcError(null);
      return true;
    } catch (error) {
      console.error('Error checking IC number:', error);
      setIcError('Error verifying IC number. Please try again.');
      return false;
    } finally {
      setIsCheckingIc(false);
    }
  };

  // Debounced version of checkIcNumber to avoid too many API calls
  const debouncedCheckIc = debounce(checkIcNumber, 500);

  const handleIcChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const value = target.value.replace(/\D/g, ''); // Remove non-digits
    setForm('identityCardNumber', value);
    
    if (value.length === 12) {
      await debouncedCheckIc(value);
    } else if (value.length > 0) {
      setIcError('IC number must be 12 digits');
    } else {
      setIcError(null);
    }
  };

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    handleChange(e);
    const pincode = e.target.value;

    if (!pincode) {
      setForm("state", "");
      setForm("city", "");
      return;
    }

    if (formData.country === "India" && pincode.length === 6) {
      setIsLoading(true);
      try {
        const addressData = await fetchAddressFromPincode(pincode);
        if (addressData) {
          setForm("state", addressData.State);
          setForm("city", addressData.District);
          toast.success("Address details fetched successfully!");
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to fetch address");
        setForm("state", "");
        setForm("city", "");
      } finally {
        setIsLoading(false);
      }
    } else if (formData.country === "Malaysia" && pincode.length === 5) {
      setIsLoading(true);
      try {
        const addressData = await fetchAddressFromPincode(pincode, "Malaysia");
        if (addressData) {
          setForm("state", addressData.State);
          setForm("city", addressData.District);
          toast.success("Address details fetched successfully!");
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to fetch address");
        setForm("state", "");
        setForm("city", "");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getRaceCategories = (gender: "MALE" | "FEMALE" | "OTHER") => {
    // Common categories for all genders
    const commonCategories = ["5km", "10km", "21km", "30km", "42km"];
    
    // Additional categories for male participants
    const maleCategories = [...commonCategories, "50km", "75km", "100km"];
    
    // For female participants, we'll allow all categories up to 100km
    const femaleCategories = [...commonCategories, "42km", "50km", "75km", "100km"];
    
    return gender === "MALE" ? maleCategories : femaleCategories;
  };

  return (
    <BambooFrame>
      <form onSubmit={handleSubmit} className="pb-5">
        <div className="grid grid-cols-2 gap-y-2 md:gap-x-20 gap-x-4">
          <RenderField
            label="First Name"
            name="firstName"
            type="text"
            placeholder="Enter your first name"
            validateInput={validateName}
            errorMessage="Please enter a valid name (letters only)"
          />
          <RenderField
            label="Last Name"
            name="lastName"
            type="text"
            placeholder="Enter your last name"
            validateInput={validateName}
            errorMessage="Please enter a valid name (letters only)"
          />

          <div className="col-span-2 md:col-span-1">
            <RenderField 
              label="Date of Birth" 
              name="dateOfBirth" 
              type="date" 
              placeholder="" 
              required
            />
          </div>
          <div className="col-span-2 md:col-span-1 relative">
            <RenderField
              label="Identity Card Number"
              name="identityCardNumber"
              type="text"
              placeholder="Enter 12-digit IC number"
              validateInput={(value) => /^\d{12}$/.test(value)}
              errorMessage="Please enter a valid 12-digit IC number"
              required
              disabled={isCheckingIc}
              onChange={handleIcChange}
            />
            {isCheckingIc && (
              <div className="absolute right-3 top-1/2 -translate-y-0">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          <div className="col-span-2">
            <RenderField 
              label="Country" 
              name="country" 
              type="select" 
              placeholder="Select Country" 
              options={getCountries()} 
            />
          </div>
          <RenderField
            label="Postal Code"
            name="pincode"
            type="text"
            placeholder={`Enter your ${formData.country === "India" ? "pincode" : "postal code"}`}
            validateInput={(value) => validatePostalCode(value, formData.country)}
            errorMessage={`Please enter a valid ${formData.country === "India" ? "pincode" : "postal code"} (${getPostalCodeFormat(formData.country)})`}
            onChange={handlePincodeChange}
          />
          <RenderField
            label="State"
            name="state"
            type="text"
            placeholder="Enter pincode to auto-fill"
            disabled={isLoading}
            errorMessage="Please enter pincode first"
            required={true}
          />
          <RenderField
            label="City"
            name="city"
            type="text"
            placeholder="Enter pincode to auto-fill"
            disabled={true}
            errorMessage="Please enter pincode first"
            required={true}
          />
          <RenderField
            label="Race Category"
            name="raceCategory"
            type="select"
            placeholder="Select Category"
            options={formData.gender ? getRaceCategories(formData.gender) : []}
            disabled={!formData.gender}
          />
          <RenderField
            label="T-Shirt Size"
            name="tShirtSize"
            type="select"
            placeholder="Select Size"
            options={["S", "M", "L", "XL", "XXL"]}
          />
          <RenderField label="Occupation" name="occupation" type="select" placeholder="Select Occupation" options={occupations} />
          <div className="col-span-2 md:col-span-1">
            <RenderField
              label="Emergency Contact Number"
              name="emergencyContactNumber"
              type="tel"
              placeholder="e.g., +60123456789"
              validateInput={(value) => !value || /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/.test(value)}
              errorMessage="Please enter a valid phone number"
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <RenderField
              label="Emergency Contact Name"
              name="emergencyContactName"
              type="text"
              placeholder="Enter emergency contact name"
              validateInput={validateName}
              errorMessage="Please enter a valid name"
            />
          </div>
          <RenderField label="Blood Group" name="bloodGroup" type="select" placeholder="Select Blood Group" options={bloodGroups} />
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            type="button"
            onClick={prevStep}
            className="md:px-6 md:py-2 px-4 py-1 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <button type="submit" className="md:px-6 md:py-2 px-4 py-1 bg-[#4CAF50] text-white text-sm rounded-lg hover:bg-[#45A049] transition-colors">
            Complete Registration
          </button>
        </div>
      </form>
    </BambooFrame>
  );
};

export default PersonalInformationForm;
