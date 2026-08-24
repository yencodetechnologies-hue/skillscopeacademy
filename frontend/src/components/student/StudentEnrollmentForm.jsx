import { useState, useEffect, useRef } from "react";
import "./StudentEnrollmentForm.css";
import EnrollmentRegister from "../enrollmrntRegister/EnrollmentRegister";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../data/service";
import { authHeaders } from "../../utils/authHeaders";

export default function StudentEnrollmentForm() {

  const [userDetails, setUserDetails] = useState(null);
  const [savedFormData, setSavedFormData] = useState(null);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [assessmentPassed, setAssessmentPassed] = useState(false);
  const [enrollmentType, setEnrollmentType] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 5;

  const enrollmentRef = useRef(null);
  const navigate = useNavigate();

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const user = JSON.parse(localStorage.getItem("user"));
  //       const studentId = user?.id;

  //       if (!studentId) throw new Error("Student ID not found. Please login again.");

  //       const [userRes, formRes, dashRes] = await Promise.all([
  //         fetch(`${API_URL}/api/students/enrollment/${studentId}`),
  //         fetch(`${API_URL}/api/enrollment-form?studentId=${studentId}`),
  //         fetch(`${API_URL}/api/student/dashboard/${studentId}`)
  //       ]);

  //       if (!userRes.ok) throw new Error("Failed to fetch user details");

  //       const userData = await userRes.json();
  //       setUserDetails(userData);

  //       if (formRes.ok) {
  //         const formData = await formRes.json();
  //         if (formData.length > 0) {
  //           const data = formData[0]; ``
  //           if (data?.personalDetails?.dob) {
  //             data.personalDetails.dob = data.personalDetails.dob.split("T")[0];
  //           }
  //           setSavedFormData(data);
  //         }
  //       }

  //       if (dashRes.ok) {
  //         const dashData = await dashRes.json();
  //         setPaymentVerified(dashData.paymentVerified === true);
  //         setAssessmentPassed(dashData.assessmentPassed === true);
  //         setEnrollmentType(dashData.enrollmentType || "");
  //         setPaymentMethod(dashData.paymentMethod || "");
  //       }

  //     } catch (err) {
  //       console.error(err);
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, []);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const error = await enrollmentRef.current?.submitForm();
      if (error) {
        alert(error);
        return;
      }

      const flowId = localStorage.getItem("flowId");
      if (!flowId) {
        alert("Flow ID not found. Please start enrollment again.");
        return;
      }

      const res = await fetch(`${API_URL}/api/flow/complete`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ flowId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to submit enrollment");
      }

      // Fire status refresh event to update Sidebar and Navbar lock states
      window.dispatchEvent(new Event("refreshStudentStatus"));

      navigate("/student?startLLN=true");
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  // if (!userDetails) return <div>No user details found.</div>;

  const canAccess = true;

  return (
    <section>
      <EnrollmentRegister
        ref={enrollmentRef}
       // userDetails={userDetails}
        savedFormData={savedFormData}
        section={step}
        setSection={setStep}
      />
      {/* Removed redundant buttons because EnrollmentRegister internal sections already have them */}
    </section>
  );
}