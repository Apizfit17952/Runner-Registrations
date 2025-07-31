"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PersonalInformationForm from "./registration/PersonalInformationForm";
import MarathonDetailsForm from "./registration/MarathonDetailsForm";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { useRegistrationStore } from "@/store/useRegistration";

const RegistrationPage = () => {
  const router = useRouter();
  const { form } = useRegistrationStore();
  const [step, setStep] = useState(1);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const nextStep = () => {
    const setAllFieldsToShowError = () => {
      const event = new CustomEvent("showAllErrors");
      document.dispatchEvent(event);
    };

    setAllFieldsToShowError();

    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const prevStep = () => setStep(step - 1);

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidMobile = (mobile: string): boolean => {
    // Malaysian numbers start with 01 followed by 8 or 9 digits (total 10 or 11)
    const mobileRegex = /^01\d{8,9}$/;
    return mobileRegex.test(mobile);
  };

  const validateStep = () => {
    console.log("Validating step", step);
    console.log("Missing fields:", {
      dateOfBirth: !form.dateOfBirth,
      selfie: !form.selfie,
      raceCategory: !form.raceCategory,
      tShirtSize: !form.tShirtSize,
    });

    switch (step) {
      case 1:
        if (!form.gender || !form.mobile || !form.email) {
          toast.error("Please fill in all required fields");
          return false;
        }
        if (!isValidMobile(form.mobile)) {
          toast.error("Please enter a valid Malaysian mobile number (e.g., 0123456789)");
          return false;
        }
        return true;

      case 2:
        const requiredFields = {
          "First Name": form.firstName,
          "Last Name": form.lastName,
          "Date of Birth": form.dateOfBirth,
          Country: form.country,
          State: form.state,
          City: form.city,
          Occupation: form.occupation,
          "Race Category": form.raceCategory,
          "T-Shirt Size": form.tShirtSize,
        };

        const missingFields = Object.entries(requiredFields)
          .filter(([value]) => !value)
          .map(([key]) => key);

        if (missingFields.length > 0) {
          toast.error(`Please fill in: ${missingFields.join(", ")}`);
          return false;
        }

        if (!isValidEmail(form.email)) {
          toast.error("Please enter a valid email address");
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("1. Form submission started");
    console.log("2. Current form data:", form);

    const isValid = validateStep();
    console.log("3. Form validation result:", isValid);

    if (!isValid) {
      console.log("4. Form validation failed - stopping submission");
      return;
    }
    
    console.log("5. Starting database operations...");
    try {
      console.log("6. Checking database connection...");
      const { error: tableError } = await supabase.from("registrations").select("id").limit(1);

      if (tableError) {
        console.error("Table verification failed:", tableError);
        throw new Error("Database table structure verification failed");
      }

      console.log("7. Database connection successful");
      console.log("8. Preparing data for Supabase insertion...");
      // First, check if IC number already exists
      const { data: existingIc } = await supabase
        .from('registrations')
        .select('id')
        .eq('identity_card_number', form.identityCardNumber)
        .maybeSingle();

      if (existingIc) {
        console.log("9. Duplicate IC number detected");
        toast.error(
          <div className="flex flex-col gap-1">
            <div className="font-bold text-white">❌ Duplicate IC Number</div>
            <div className="text-sm">
              The IC number you entered is already registered in our system.
            </div>
            <div className="text-xs text-gray-300">
              Please use a different IC number or contact support at support@apizfit.com if you need assistance.
            </div>
          </div>,
          {
            duration: 8000,
            style: {
              background: '#ef4444',
              color: 'white',
              borderRadius: '0.5rem',
              borderLeft: '4px solid #dc2626',
              maxWidth: '420px',
              padding: '1rem',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#ef4444',
            },
          }
        );
        return;
      }

      const registrationData = {
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        mobile: form.mobile,
        gender: form.gender,
        date_of_birth: form.dateOfBirth,
        identity_card_number: form.identityCardNumber,
        country: form.country,
        state: form.state,
        city: form.city,
        occupation: form.occupation,
        race_category: form.raceCategory,
        t_shirt_size: form.tShirtSize,
        emergency_contact_name: form.emergencyContactName || null,
        emergency_contact_number: form.emergencyContactNumber || null,
        blood_group: form.bloodGroup || null,
        is_from_bastar: form.isFromBastar,
        needs_accommodation: form.needsAccommodation,
      };

      try {
        console.log("9. Attempting to insert registration data...");
        const { data, error } = await supabase
          .from("registrations")
          .insert([registrationData])
          .select("id");
        
        if (error) {
          console.error("10. Database insertion error:", error);
          throw error;
        }
        
        console.log("10. Successfully inserted with ID:", data?.[0]?.id);
        
        console.log("11. Showing success toast...");
        // Show success message
        const successToast = () => {
          toast.success(
            <div className="flex flex-col gap-1">
              <div className="font-bold">🎉 Registration Successful!</div>
              <div className="text-sm">Thank you for registering for ApizRace.</div>
              <div className="text-xs text-gray-300">A confirmation has been sent to your email.</div>
            </div>,
            {
              duration: 8000,
            }
          );
          
          // Clear the form state for the next registration
          useRegistrationStore.getState().resetForm();
          
          // Reset to step 1
          setStep(1);
          
          // Scroll to top of the form
          window.scrollTo({ top: 0, behavior: 'smooth' });
          
          console.log("12. Success toast shown and form reset");
        };
        
        // Ensure the toast is shown in the next tick
        setTimeout(successToast, 100);
      } catch (insertErr) {
        console.error("Supabase insertion error:", insertErr);
        
        // Handle duplicate email error
        if ((insertErr as any)?.code === "23505" || 
            (insertErr as any)?.message?.includes("duplicate key value") ||
            (insertErr as any)?.message?.includes("registrations_email_key")) {
          
          setErrorMessage('This email is already registered. Please use a different email address or contact support if you need assistance.');
          setShowErrorModal(true);
        } else if ((insertErr as any)?.code === '22P02' || (insertErr as any)?.message?.includes('invalid input syntax')) {
          setErrorMessage('Please check your information and try again. Some fields contain invalid characters.');
          setShowErrorModal(true);
        } else if ((insertErr as any)?.code === '23502' || (insertErr as any)?.message?.includes('null value in column')) {
          setErrorMessage('Please fill in all required fields before submitting.');
          setShowErrorModal(true);
        } else if ((insertErr as any)?.code === '23514' || (insertErr as any)?.message?.includes('check constraint')) {
          setErrorMessage('One or more fields contain invalid data. Please check your entries and try again.');
          setShowErrorModal(true);
        } else if ((insertErr as any)?.code === '23503' || (insertErr as any)?.message?.includes('foreign key constraint')) {
          setErrorMessage('There was a problem with your registration data. Please try again or contact support.');
          setShowErrorModal(true);
        } else {
          // Handle other errors with a friendly message
          setErrorMessage('We encountered an issue processing your registration. Please try again in a few moments. If the problem persists, please contact our support team.');
          setShowErrorModal(true);
        }
        
        return;
      }

      

      try {
        const emailData = {
          userData: {
            personal_info: {
              email: form.email,
              firstName: form.firstName,
              lastName: form.lastName,
            },
            marathon_details: {
              raceCategory: form.raceCategory,
              tShirtSize: form.tShirtSize,
            },
          },
        };

        const emailResponse = await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailData),
        });

        if (!emailResponse.ok) {
          console.error("Failed to send confirmation email");
        }
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
      }

      toast.success(
        <div className="flex flex-col gap-1">
          <div className="font-bold text-white">🎉 Registration Successful!</div>
          <div className="text-sm">Thank you for registering for ApizRace.</div>
          <div className="text-xs text-gray-300">A confirmation has been sent to your email.</div>
        </div>,
        {
          duration: 8000,
          style: {
            background: '#10B981',
            color: 'white',
            borderRadius: '0.5rem',
            borderLeft: '4px solid #059669',
            maxWidth: '420px',
            padding: '1rem',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#10B981',
          },
        }
      );
    } catch (error) {
      console.error("Full error object:", error);
      toast.error(
        <div className="flex flex-col gap-1">
          <div className="font-bold">❌ Registration Issue</div>
          <div className="text-sm">We couldn't complete your registration.</div>
          <div className="text-xs text-gray-300">Please check your details and try again.</div>
        </div>,
        {
          duration: 5000,
        }
      );
    }
  };

  const renderStep = () => {
    if (step < 1) setStep(1);
    if (step > 2) setStep(2);

    switch (step) {
      case 1:
        return <MarathonDetailsForm nextStep={nextStep} />;
      case 2:
        return <PersonalInformationForm prevStep={prevStep} handleSubmit={handleSubmit} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in border border-red-500">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0">
                <div className="bg-red-100 p-2 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-white">Registration Error</h3>
                <div className="mt-2 text-gray-300">
                  <p>{errorMessage}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowErrorModal(false)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                aria-label="Close error message"
                title="Close"
              >
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <Image src="/bg-image.jpg" alt="Jungle Background" fill sizes="100vw" className="absolute w-screen min-h-screen object-cover md:block hidden" priority />
      <Image src="/mobile/background.png" alt="Jungle Background" fill sizes="100vw" className="absolute w-screen h-screen top-0 object-cover block md:hidden" priority />

      <div className="relative md:w-full mx-auto flex flex-col flex-grow items-center justify-center md:px-4 sm:px-12">
        <Image src="/mobile/box.png" height={700} width={400} alt="Box" className="absolute w-full h-full object-cover object-top block md:hidden" priority />
        <div className="relative h-36 w-2/3 z-10 sm:mt-10 mt-7 flex justify-center items-center">
          <Image
            src="/mobile/header-background.png"
            height={300}
            width={100}
            alt="Box"
            className="absolute w-full h-full object-contain block md:hidden"
            priority
          />
          <h2 className="z-10 md:hidden sm:text-3xl text-2xl font-bold text-center text-white">
            ApizRace
            <br />
            Registration
          </h2>
        </div>

        <div className="w-full max-w-2xl mx-auto md:mt- space-y-5 p-2 z-10">
          <div className="flex justify-between p-4 w-full rounded-xl md:bg-gray-900/50 md:backdrop-blur">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center">
                <div className={`w-10 h-10 rounded-full ${step >= i ? "bg-[#4CAF50]" : "bg-gray-600"} flex items-center justify-center`}>
                  <span className="text-lg font-semibold text-white">{i}</span>
                </div>
                <div className="ml-4">
                  <p className={`${step >= i ? "text-[#4CAF50]" : "text-gray-400"} font-bold`}>Step {i}</p>
                  <p className="text-sm text-gray-300">{i === 1 ? "Race Details" : "Personal Details"}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="px-6">
            <div className="z-10">{renderStep()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
