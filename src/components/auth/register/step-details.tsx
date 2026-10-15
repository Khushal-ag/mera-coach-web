"use client";

import type { RegisterFormController } from "./use-register-form";

import { MenuSelect } from "@/components/ui/menu-select";
import { EXPERIENCE } from "@/constants/register";
import { cn } from "@/lib/utils";

export function RegisterDetailsStep({
  form,
}: {
  form: RegisterFormController;
}) {
  const {
    step,
    services,
    servicesOpen,
    setServicesOpen,
    selectedServices,
    setSelectedServices,
    businessName,
    setBusinessName,
    experience,
    setExperience,
    clients,
    setClients,
    showStep,
    serviceLabel,
  } = form;
  return (
    <div
      className={cn("rg-panel", step === 2 ? "" : "rg-hidden")}
      id="rgPanel2"
    >
      <div className="rg-section-head">
        <div className="rg-sh-icon rg-sh-gold">
          <i className="fas fa-user-tie" />
        </div>
        <div>
          <h2>Coach Details</h2>
          <p>Your expertise, services and experience</p>
        </div>
        <span className="rg-optional-note">All optional</span>
      </div>
      <div className="rg-skip-note">
        <i className="fas fa-check-circle" />
        <span>
          These details are optional. You can complete them now or after you log
          in.
        </span>
      </div>
      <div className="rg-grid">
        <div className="rg-field rg-col-2">
          <label>
            <i className="fas fa-tag" /> Service / Specialisation
          </label>
          <div
            className={cn("rg-multiselect", servicesOpen ? "rg-ms-open" : "")}
            id="rgServiceWrap"
          >
            <div
              className="rg-multiselect-trigger"
              role="button"
              tabIndex={0}
              onClick={() => setServicesOpen((open) => !open)}
            >
              <span>{serviceLabel}</span>
              <i className="fas fa-chevron-down" />
            </div>
            <div
              className={cn(
                "rg-multiselect-panel",
                servicesOpen ? "" : "rg-hidden",
              )}
            >
              {services.length === 0 ?
                <p className="rg-field-note">
                  No services returned for this category.
                </p>
              : services.map((service) => (
                  <label key={service.code}>
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service.label)}
                      onChange={() => {
                        setSelectedServices((current) =>
                          current.includes(service.label) ?
                            current.filter((item) => item !== service.label)
                          : [...current, service.label],
                        );
                      }}
                    />
                    {service.label}
                  </label>
                ))
              }
            </div>
          </div>
        </div>
        <div className="rg-field rg-col-2">
          <label htmlFor="rgBizName">
            <i className="fas fa-building" /> Business Name
          </label>
          <input
            id="rgBizName"
            placeholder="Academy / studio / clinic name"
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
          />
        </div>
        <div className="rg-field rg-col-2">
          <label htmlFor="rgExp">
            <i className="fas fa-briefcase" /> Experience (Years)
          </label>
          <MenuSelect
            id="rgExp"
            skin="public"
            className="ui-select"
            value={experience}
            placeholder="-- Select --"
            options={[
              { value: "", label: "-- Select --" },
              ...EXPERIENCE.map((item) => ({
                value: item.value,
                label: item.label,
              })),
            ]}
            onChange={(event) => setExperience(event.target.value)}
          />
        </div>
        <div className="rg-field rg-col-2">
          <label htmlFor="rgClients">
            <i className="fas fa-smile" /> Happy Customers
          </label>
          <input
            id="rgClients"
            type="number"
            placeholder="e.g. 120"
            min={0}
            max={1000}
            value={clients}
            onChange={(event) => setClients(event.target.value)}
          />
        </div>
      </div>
      <div className="rg-nav">
        <button
          type="button"
          className="btn rg-btn-back"
          onClick={() => showStep(1)}
        >
          <i className="fas fa-arrow-left" /> Back
        </button>
        <button
          type="button"
          className="btn rg-btn-next"
          onClick={() => showStep(3)}
        >
          Next: Contact Details <i className="fas fa-arrow-right" />
        </button>
      </div>
    </div>
  );
}
