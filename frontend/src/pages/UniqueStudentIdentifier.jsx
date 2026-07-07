import { useState } from "react";
import { colors } from "../constants/theme";
import PublicNavbar from "../components/PublicNavbar";
import Footer from "../components/landingPage/Footer";import "../styles/UniqueStudentIdentifier.css";

const steps = [
  {
    id: 1,
    content: (
      <p>
        Have at least one and preferably two forms of ID ready from the list
        below: Driver's Licence, Medicare Card, Australian Passport, Visa (with
        Non-Australian Passport) for international students, Birth Certificate
        (Australian), Certificate Of Registration By Descent, Citizenship
        Certificate, or Immi Card.
      </p>
    ),
  },
  {
    id: 2,
    content: (
      <p>
        Have your personal contact details ready (e.g. email address, or mobile
        number, or mailing address).
      </p>
    ),
  },
  {
    id: 3,
    content: (
      <p>
        Visit the USI website at:{" "}
        <a href="https://www.usi.gov.au" target="_blank" rel="noreferrer">
          usi.gov.au
        </a>
        .
      </p>
    ),
  },
  {
    id: 4,
    content: (
      <p>
        Select 'Student Entry' and then Select 'Create a USI' link and follow
        the steps.
      </p>
    ),
  },
  {
    id: 5,
    content: (
      <p>
        Select 'Student Entry' and then Select 'Create a USI' link and follow
        the steps.
      </p>
    ),
  },
  {
    id: 6,
    content: (
      <p>
        Follow the instructions to create a USI— it should only take a few
        minutes. Upon completion, the USI will be displayed on the screen. It
        will also be sent to your preferred method of contact.
      </p>
    ),
  },
  {
    id: 7,
    content: (
      <p>
        You should then write down your USI and keep it handy and safe
        somewhere, perhaps on your phone.
      </p>
    ),
  },
];

const idTypes = [
  "Driver's Licence",
  "Medicare Card",
  "Australian Passport",
  "Visa (with Non-Australian Passport) for international students",
  "Birth Certificate (Australian)",
  "Certificate Of Registration By Descent",
  "Citizenship Certificate",
  "Immi Card",
];

function CheckIcon() {
  return (
    <span className="usi-check">
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke={colors.brandAccent} strokeWidth="2" />
        <path
          d="M7 12.5l3.5 3.5 6.5-7"
          stroke={colors.brandAccent}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function UniqueStudentIdentifier() {
  const [openStep, setOpenStep] = useState(1);

  const toggle = (id) => setOpenStep(openStep === id ? null : id);

  return (
    <>
      <PublicNavbar />

      {/* Page banner */}
      <div className="usi-banner">
        <h1>Unique Student Identifier (USI)</h1>
        <p>Everything you need to know about your USI number</p>
      </div>

      <div className="usi-container">
        <div className="usi-main-grid">

          {/* ── LEFT COLUMN ── */}
          <div className="usi-left">
            <h2>USI … bringing your skills together</h2>

            {/* 4-step icon row */}
            <div className="usi-icon-row">
              {[
                {
                  num: 1,
                  label: "Create a USI",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="white">
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                    </svg>
                  ),
                },
                {
                  num: 2,
                  label: "Keep a record of your number",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="white">
                      <path d="M18 8h-1V6A5 5 0 0 0 7 6v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2zM12 17a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm3.1-9H8.9V6a3.1 3.1 0 0 1 6.2 0v2z" />
                    </svg>
                  ),
                },
                {
                  num: 3,
                  label: "Enrol in registered training",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 11l3 3L22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                  ),
                },
                {
                  num: 4,
                  label: "Access your transcript",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="white">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 13h8v1.5H8V13zm0 3h8v1.5H8V16zm0-6h5v1.5H8V10z" />
                    </svg>
                  ),
                },
              ].map((step, i, arr) => (
                <div key={step.num} className="usi-icon-group">
                  <div className="usi-icon-wrap">
                    <span className="usi-icon-num">{step.num}</span>
                    <div className="usi-icon-circle">{step.icon}</div>
                  </div>
                  <span className="usi-icon-label">{step.label}</span>
                  {i < arr.length - 1 && (
                    <span className="usi-icon-arrow">›</span>
                  )}
                </div>
              ))}
            </div>

            <p>
              If you are undertaking nationally recognised training delivered by
              a registered training organisation you will need to have a Unique
              Student Identifier (USI). This includes studying at TAFE or with a
              private training organisation, completing an apprenticeship or
              skill set, certificate or diploma course.
            </p>

            <p>
              A USI gives you access to your online USI account which is made up
              of ten numbers and letters. It will look something like this:{" "}
              <strong>3AW88YH9U5.</strong>
            </p>

            <p>
              In time, your USI account will contain all your nationally
              recognised training records and results from 1 January 2015
              onwards. Your results from 2015 will be available in your USI
              account in 2016.
            </p>

            <p>
              When applying for a job or enrolling in further study, you will
              often need to provide your training records and results. One of the
              main benefits of the USI is that you will have easy access to your
              training records and results throughout your life.
            </p>

            <p>
              You can access your USI account online from a computer, tablet or
              smart phone anywhere and anytime.
            </p>

            <p>
              You are a continuing student if you are a student who has already
              started your course in a previous year (and not yet completed it)
              and will continue studying after 1 January 2015.
            </p>

            <p>
              Once you create your USI you will need to give your USI to each
              training organisation you study with so your training outcomes can
              be linked and you will be able to:
            </p>

            <ul className="usi-check-list">
              {[
                "view and update your details in your USI account;",
                "give your training organisation permission to view and/or update your USI account;",
                "give your training organisation view access to your transcript;",
                "control access to your transcript; and",
                "view online and download your training records and results in the form of a transcript which will help you with job applications and enrolment in further training.",
              ].map((item, i) => (
                <li key={i}>
                  <CheckIcon />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <h3>Do you need a USI?</h3>

            <ul className="usi-check-list">
              {[
                "student enrolling in nationally recognised training for the first time, for example if you are studying at TAFE or with a private training organisation, completing an apprenticeship or skill set, certificate or diploma course;",
                "school student completing nationally recognised training; or",
                "student continuing with nationally recognised training.",
              ].map((item, i) => (
                <li key={i}>
                  <CheckIcon />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <p>
              You will need a USI when you enrol or re-enrol in training if you
              are a:
            </p>

            <h3>How to get a USI?</h3>

            <p>It is free and easy for you to create your own USI online.</p>

            <p>
              While you may create your own USI, training organisations are also
              able to create a USI for you. Training organisations should do this
              as part of the enrolment process when you begin studying. Where
              this service is provided, training organisations will let you know.
            </p>

            <div className="usi-more-info">
              <h3>More Information</h3>
              <p>
                For more information please visit:{" "}
                <strong>usi.gov.au</strong>
              </p>
              <p>Or</p>
              <p>
                contact us at Email:{" "}
                <strong>usi@education.gov.au</strong>
              </p>
              <p>
                Phone: Skilling Australia Information line—
                <strong>13 38 73</strong>
              </p>
              <p>
                To view this document online please visit:{" "}
                <strong>usi.gov.au</strong>
              </p>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="usi-right">
            {/* Steps accordion (right side, matching screenshots) */}
            <div className="usi-steps-wrapper">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`usi-step-card ${openStep === step.id ? "open" : ""}`}
                >
                  <div
                    className="usi-step-header"
                    onClick={() => toggle(step.id)}
                  >
                    <span>Step {step.id}</span>
                    <span className="usi-step-toggle">
                      {openStep === step.id ? (
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="9" />
                          <path d="M8 12h8" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="9" />
                          <path d="M8 12h8M12 8v8" />
                        </svg>
                      )}
                    </span>
                  </div>
                  {openStep === step.id && (
                    <div className="usi-step-body">
                      {/* Step 1 shows the ID panel */}
                      {step.id === 1 && (
                        <>
                          <p className="usi-id-heading">
                            <strong>
                              Have at least one and preferably two forms of ID
                              ready from the list below:
                            </strong>
                          </p>
                          <ul className="usi-id-list">
                            {idTypes.map((id, i) => (
                              <li key={i}>
                                <CheckIcon />
                                <span>{id}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="usi-important">
                            <p>
                              <strong>Important</strong>
                            </p>
                            <p>
                              To make sure we keep all of your training records
                              together, the USI will be linked to your name as
                              it appears on the form of ID you used to create
                              the USI. The personal details entered when you
                              create a USI must match exactly with those on your
                              form of ID.
                            </p>
                            <p>
                              If you do not have proof of ID from the list
                              above, you can contact your training organisation
                              about the other forms of ID they can accept to
                              help you get a USI.
                            </p>
                          </div>
                        </>
                      )}
                      {step.id !== 1 && step.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}