import { useEffect, useMemo, useState } from "react";

const VEHICLES = {
  comfort: {
    name: "BYD Dolphin Surf Comfort",
    shortName: "Comfort",
    batteryKwh: 30.0,
    claimedRangeKm: 232,
    powerKw: 55,
    defaultDcChargeKw: 30,
    defaultAcChargeKw: 6.6,
    defaultWallChargeKw: 2.3,
    defaultWallCostPerKwh: 4.0,
    defaultAcCostPerKwh: 5.86,
    defaultDcCostPerKwh: 7.35,
    defaultEfficiency: 13.2,
    defaultSafetyBuffer: 10,
    notes: [
      "30.0 kWh Blade Battery",
      "232 km claimed range",
      "55 kW motor",
      "Up to 30 kW DC charging",
    ],
  },
  dynamic: {
    name: "BYD Dolphin Surf Dynamic",
    shortName: "Dynamic",
    batteryKwh: 38.8,
    claimedRangeKm: 295,
    powerKw: 55,
    defaultDcChargeKw: 40,
    defaultAcChargeKw: 6.6,
    defaultWallChargeKw: 2.3,
    defaultWallCostPerKwh: 4.0,
    defaultAcCostPerKwh: 5.86,
    defaultDcCostPerKwh: 7.35,
    defaultEfficiency: 13.2,
    defaultSafetyBuffer: 10,
    notes: [
      "38.8 kWh Blade Battery",
      "295 km claimed range",
      "55 kW motor",
      "Up to 40 kW DC charging",
    ],
  },
};

const CHARGE_TYPES = [
  { key: "wall", label: "Wall" },
  { key: "ac", label: "AC" },
  { key: "dc", label: "DC" },
];

const CAR_COLOURS = [
  { key: "default", label: "Silver", image: "/car-default.png", swatch: "#c8cedb", border: "#9aa3b6" },
  { key: "lime", label: "Lime", image: "/car-lime.png", swatch: "#bfd62f", border: "#8fa116" },
  { key: "cream", label: "Cream", image: "/car-cream.png", swatch: "#efe7d8", border: "#c9bda7" },
  { key: "black", label: "Black", image: "/car-black.png", swatch: "#151515", border: "#444444" },
  { key: "blue", label: "Blue", image: "/car-blue.png", swatch: "#78aee8", border: "#4c82bb" },
];

export default function App() {
  const [appStep, setAppStep] = useState("login");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [tab, setTab] = useState("trip");
  const [selectedVehicle, setSelectedVehicle] = useState("dynamic");
  const [selectedColour, setSelectedColour] = useState("default");
  const [chargeType, setChargeType] = useState("wall");

  const [batteryPercent, setBatteryPercent] = useState(80);
  const [tripDistance, setTripDistance] = useState(120);
  const [chargeStart, setChargeStart] = useState(80);
  const [chargeTarget, setChargeTarget] = useState(80);

  const [efficiency, setEfficiency] = useState(VEHICLES.dynamic.defaultEfficiency);
  const [safetyBuffer, setSafetyBuffer] = useState(VEHICLES.dynamic.defaultSafetyBuffer);

  const [wallChargeKw, setWallChargeKw] = useState(VEHICLES.dynamic.defaultWallChargeKw);
  const [acChargeKw, setAcChargeKw] = useState(VEHICLES.dynamic.defaultAcChargeKw);
  const [dcChargeKwComfort, setDcChargeKwComfort] = useState(VEHICLES.comfort.defaultDcChargeKw);
  const [dcChargeKwDynamic, setDcChargeKwDynamic] = useState(VEHICLES.dynamic.defaultDcChargeKw);

  const [wallCostPerKwh, setWallCostPerKwh] = useState(VEHICLES.dynamic.defaultWallCostPerKwh);
  const [acCostPerKwh, setAcCostPerKwh] = useState(VEHICLES.dynamic.defaultAcCostPerKwh);
  const [dcCostPerKwh, setDcCostPerKwh] = useState(VEHICLES.dynamic.defaultDcCostPerKwh);

  const vehicle = VEHICLES[selectedVehicle];
  const batterySize = vehicle.batteryKwh;
  const selectedDcChargeKw = selectedVehicle === "comfort" ? dcChargeKwComfort : dcChargeKwDynamic;

  const selectedChargePower = useMemo(() => {
    if (chargeType === "wall") return wallChargeKw;
    if (chargeType === "ac") return acChargeKw;
    return selectedDcChargeKw;
  }, [chargeType, wallChargeKw, acChargeKw, selectedDcChargeKw]);

  const costPerKwh = useMemo(() => {
    if (chargeType === "wall") return wallCostPerKwh;
    if (chargeType === "ac") return acCostPerKwh;
    return dcCostPerKwh;
  }, [chargeType, wallCostPerKwh, acCostPerKwh, dcCostPerKwh]);

  const selectedCarImage =
    CAR_COLOURS.find((item) => item.key === selectedColour)?.image || "/car-default.png";

  const selectedColourLabel =
    CAR_COLOURS.find((item) => item.key === selectedColour)?.label || "Silver";

  const availableRange = useMemo(() => {
    const usableKwh = (batteryPercent / 100) * batterySize;
    return (usableKwh / efficiency) * 100;
  }, [batteryPercent, batterySize, efficiency]);

  const tripEnergyNeeded = useMemo(() => {
    return (tripDistance * efficiency) / 100;
  }, [tripDistance, efficiency]);

  const batteryUsedForTripPercent = useMemo(() => {
    return (tripEnergyNeeded / batterySize) * 100;
  }, [tripEnergyNeeded, batterySize]);

  const batteryAfterTrip = useMemo(() => {
    return Math.max(batteryPercent - batteryUsedForTripPercent, 0);
  }, [batteryPercent, batteryUsedForTripPercent]);

  const suggestedMinimumBattery = useMemo(() => {
    return Math.min(Math.ceil(batteryUsedForTripPercent + safetyBuffer), 100);
  }, [batteryUsedForTripPercent, safetyBuffer]);

  const hasEnoughBatteryForTrip = batteryPercent >= suggestedMinimumBattery;

  useEffect(() => {
    setChargeStart(batteryPercent);
  }, [batteryPercent]);

  useEffect(() => {
    setChargeTarget(suggestedMinimumBattery);
  }, [suggestedMinimumBattery]);

  const chargeEnergyToAdd = useMemo(() => {
    if (chargeTarget <= chargeStart) return 0;
    return ((chargeTarget - chargeStart) / 100) * batterySize;
  }, [chargeStart, chargeTarget, batterySize]);

  const chargeTimeHoursDecimal = useMemo(() => {
    if (selectedChargePower <= 0 || chargeTarget <= chargeStart) return 0;
    return chargeEnergyToAdd / selectedChargePower;
  }, [selectedChargePower, chargeTarget, chargeStart, chargeEnergyToAdd]);

  const formattedChargeTime = useMemo(() => {
    if (chargeTarget <= chargeStart) return "Set target above start";

    const totalMinutes = Math.round(chargeTimeHoursDecimal * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) return `${minutes} min`;
    if (minutes === 0) return `${hours} hr`;
    return `${hours} hr ${minutes} min`;
  }, [chargeTimeHoursDecimal, chargeTarget, chargeStart]);

  const estimatedChargeCost = useMemo(() => {
    return chargeEnergyToAdd * costPerKwh;
  }, [chargeEnergyToAdd, costPerKwh]);

  const resetDefaults = () => {
    setEfficiency(VEHICLES.dynamic.defaultEfficiency);
    setSafetyBuffer(VEHICLES.dynamic.defaultSafetyBuffer);
    setWallChargeKw(VEHICLES.dynamic.defaultWallChargeKw);
    setAcChargeKw(VEHICLES.dynamic.defaultAcChargeKw);
    setDcChargeKwComfort(VEHICLES.comfort.defaultDcChargeKw);
    setDcChargeKwDynamic(VEHICLES.dynamic.defaultDcChargeKw);
    setWallCostPerKwh(VEHICLES.dynamic.defaultWallCostPerKwh);
    setAcCostPerKwh(VEHICLES.dynamic.defaultAcCostPerKwh);
    setDcCostPerKwh(VEHICLES.dynamic.defaultDcCostPerKwh);
  };

  if (appStep === "login") {
    return (
      <ScreenShell>
        <div style={loginCard}>
          <div style={bydBadge}>BYD</div>
          <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.1, whiteSpace: "normal", textAlign: "center" }}>
  BYD Dolphin Surf
</h1>
          <p style={{ color: "#64748b" }}>Range, trip and charging calculator</p>
          <button style={primaryButton} onClick={() => setAppStep("terms")}>
            Enter App
          </button>
        </div>
      </ScreenShell>
    );
  }

  if (appStep === "terms") {
    return (
      <ScreenShell>
        <div style={termsCard}>
          <h2 style={{ marginTop: 0 }}>Terms & Conditions</h2>

          <div style={termsTextBox}>
            <h3>IMPORTANT NOTICE AND DISCLAIMER</h3>
            <p>
              This application provides estimates, projections, and general guidance only.
              Outputs may be affected by driving style, speed, terrain, traffic, weather,
              vehicle condition, tyre pressure, battery degradation, load, route choice,
              elevation changes, GPS accuracy and mapping data.
            </p>
            <p>
              Actual results may differ significantly from the estimates provided by the App.
              You must not rely solely on this App for planning, safety, or operational decisions.
            </p>

            <h3>Acceptance of Terms</h3>
            <p>
              By accessing or using this App, you confirm that you have read and understood
              these Terms, agree to be bound by them, and accept all risks associated with use
              of the App.
            </p>

            <h3>Nature of the Application</h3>
            <p>
              The App is intended for informational and estimation purposes only. It does not
              guarantee accuracy, provide real-time verified data, or replace vehicle systems,
              navigation systems, or professional advice.
            </p>

            <h3>User Responsibility</h3>
            <p>
              You are solely responsible for how you use the App, for complying with applicable
              laws, and for operating your vehicle safely at all times.
            </p>

            <h3>Accuracy and Limitations</h3>
            <p>
              The App may contain errors, inaccuracies, or outdated information. Results depend
              on user input and external data sources. No warranties are given regarding
              accuracy, completeness, reliability, or suitability for any purpose.
            </p>

            <h3>Limitation of Liability</h3>
            <p>
              To the fullest extent permitted by law, the App owner, developer, and affiliates
              shall not be liable for any loss, damage, injury, incorrect estimates, vehicle
              damage, financial loss, missed destinations, delays, safety incidents, or any
              indirect or consequential damages.
            </p>

            <h3>Safety Disclaimer</h3>
            <p>
              The App must not be used while driving in a manner that distracts from the road,
              as a replacement for vehicle instrumentation, or for emergency or safety-critical
              decisions. Always prioritise road safety and legal compliance.
            </p>

            <h3>Governing Law</h3>
            <p>These Terms are governed by the laws of the Republic of South Africa.</p>
          </div>

          <label style={checkboxRow}>
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
            />
            <span>I have read and agree to the Terms and Conditions and Privacy Policy.</span>
          </label>

          <button
            disabled={!acceptedTerms}
            onClick={() => setAppStep("app")}
            style={{
              ...primaryButton,
              opacity: acceptedTerms ? 1 : 0.45,
              cursor: acceptedTerms ? "pointer" : "not-allowed",
            }}
          >
            Continue
          </button>
        </div>
      </ScreenShell>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #eaf2ff 0%, #f7f9fc 45%, #eef3f8 100%)",
        display: "flex",
        justifyContent: "center",
        padding: "24px 12px",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ width: "100%", maxWidth: 430 }}>
        <div style={warningBanner}>
          Estimates only. Actual results may vary. Do not rely solely on this app for planning or safety decisions.
        </div>

        <div
          style={{
            width: "100%",
            background: "#fdfefe",
            borderRadius: 36,
            boxShadow: "0 24px 60px rgba(15, 23, 42, 0.16)",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.75)",
          }}
        >
          <div
            style={{
              background:
                "linear-gradient(135deg, #07152f 0%, #0d2347 55%, #153971 100%)",
              padding: 22,
              color: "white",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 18,
              }}
            >
              <div style={bydBadge}>BYD</div>

              <div
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  borderRadius: 18,
                  padding: "10px 14px",
                  textAlign: "right",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div style={{ fontSize: 12, opacity: 0.75 }}>Licensed to</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>Mark Dyall</div>
              </div>
            </div>

            <div
              style={{
                background:
                  "linear-gradient(160deg, rgba(255,255,255,0.18), rgba(255,255,255,0.07))",
                borderRadius: 28,
                padding: 18,
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                {Object.entries(VEHICLES).map(([key, item]) => {
                  const active = selectedVehicle === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedVehicle(key)}
                      style={{
                        border: "none",
                        borderRadius: 14,
                        padding: "10px 14px",
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: "pointer",
                        background: active ? "#ffffff" : "rgba(255,255,255,0.14)",
                        color: active ? "#0f172a" : "#ffffff",
                        boxShadow: active
                          ? "0 10px 24px rgba(0,0,0,0.18)"
                          : "inset 0 0 0 1px rgba(255,255,255,0.12)",
                      }}
                    >
                      {item.shortName}
                    </button>
                  );
                })}
              </div>

              <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 10, letterSpacing: 0.4 }}>
                EV Range Planner
              </div>

              <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1, marginBottom: 16 }}>
                {vehicle.name}
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 22,
                  padding: 14,
                  marginBottom: 16,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 210,
                }}
              >
                <img
                  src={selectedCarImage}
                  alt={`${vehicle.name} ${selectedColourLabel}`}
                  style={{
                    maxWidth: "100%",
                    maxHeight: 220,
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, opacity: 0.78, marginBottom: 10 }}>
                  Vehicle colour: {selectedColourLabel}
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {CAR_COLOURS.map((colour) => {
                    const active = selectedColour === colour.key;
                    return (
                      <button
                        key={colour.key}
                        onClick={() => setSelectedColour(colour.key)}
                        title={colour.label}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          border: active ? "3px solid #ffffff" : `2px solid ${colour.border}`,
                          background: colour.swatch,
                          cursor: "pointer",
                          boxShadow: active ? "0 0 0 3px rgba(255,255,255,0.22)" : "none",
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.12)",
                  borderRadius: 20,
                  padding: 16,
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>
                  Current battery
                </div>
                <div style={{ fontSize: 30, fontWeight: 800 }}>{batteryPercent}%</div>
                <div style={{ marginTop: 10 }}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={batteryPercent}
                    onChange={(e) => setBatteryPercent(Number(e.target.value))}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: 18 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 10,
                marginBottom: 18,
              }}
            >
              {[
                { key: "trip", label: "Trip" },
                { key: "charge", label: "Charge" },
                { key: "specs", label: "Specs" },
                { key: "settings", label: "Set" },
              ].map((item) => {
                const active = tab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setTab(item.key)}
                    style={{
                      border: "none",
                      borderRadius: 16,
                      padding: "14px 8px",
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: "pointer",
                      background: active ? "#0f172a" : "#eef2f7",
                      color: active ? "white" : "#334155",
                      boxShadow: active
                        ? "0 12px 24px rgba(15,23,42,0.22)"
                        : "inset 0 0 0 1px rgba(148,163,184,0.18)",
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {tab === "trip" && (
              <div style={{ display: "grid", gap: 14 }}>
                <SectionCard
                  title="Trip Calculator"
                  subtitle="Plan your trip and see whether your current battery is enough."
                >
                  <SliderField
                    label="Planned trip distance"
                    value={tripDistance}
                    suffix=" km"
                    min={10}
                    max={500}
                    onChange={setTripDistance}
                  />
                </SectionCard>

                {!hasEnoughBatteryForTrip && (
                  <WarningCard text="Current battery is not sufficient for this trip while keeping your safety buffer. Please charge first or reduce the planned trip distance." />
                )}

                <InfoRow label="Estimated available range" value={`${Math.round(availableRange)} km`} />
                <InfoRow label="Energy needed for trip" value={`${tripEnergyNeeded.toFixed(1)} kWh`} />
                <InfoRow label="Battery expected after trip" value={`${batteryAfterTrip.toFixed(0)}%`} />
                <InfoRow label="Suggested minimum battery before trip" value={`${suggestedMinimumBattery}%`} />
              </div>
            )}

            {tab === "charge" && (
              <div style={{ display: "grid", gap: 14 }}>
                <SectionCard
                  title="Charging Estimate"
                  subtitle="Charge start and target default from your trip plan, but can still be adjusted."
                >
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                    {CHARGE_TYPES.map((item) => {
                      const active = chargeType === item.key;
                      return (
                        <button
                          key={item.key}
                          onClick={() => setChargeType(item.key)}
                          style={{
                            border: "none",
                            borderRadius: 14,
                            padding: "12px 10px",
                            fontWeight: 700,
                            fontSize: 14,
                            cursor: "pointer",
                            background: active ? "#0f172a" : "#eef2f7",
                            color: active ? "white" : "#334155",
                          }}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>

                  <SliderField label="Charge start" value={chargeStart} suffix="%" min={0} max={100} onChange={setChargeStart} />
                  <SliderField label="Charge target" value={chargeTarget} suffix="%" min={0} max={100} onChange={setChargeTarget} />
                </SectionCard>

                <div style={darkResultCard}>
                  <div style={{ fontSize: 13, opacity: 0.72, marginBottom: 8 }}>Estimated charging time</div>
                  <div style={{ fontSize: 34, fontWeight: 800 }}>{formattedChargeTime}</div>

                  <div style={{ marginTop: 18, fontSize: 13, opacity: 0.72, marginBottom: 8 }}>
                    Estimated charging cost
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800 }}>
                    R{estimatedChargeCost.toFixed(2)}
                  </div>

                  <div style={{ marginTop: 10, fontSize: 13, opacity: 0.74 }}>
                    Based on {vehicle.batteryKwh} kWh battery using {selectedChargePower.toFixed(1)} kW charging at R{costPerKwh.toFixed(2)}/kWh.
                  </div>
                </div>

                <InfoRow label="Energy to add" value={`${chargeEnergyToAdd.toFixed(1)} kWh`} />
              </div>
            )}

            {tab === "specs" && (
              <div style={{ display: "grid", gap: 14 }}>
                <SectionCard title={`${vehicle.shortName} specifications`} subtitle="Vehicle and planning assumptions used by the app">
                  {vehicle.notes.map((note) => (
                    <SpecPill key={note} text={note} />
                  ))}
                </SectionCard>

                <InfoRow label="Selected colour" value={selectedColourLabel} />
                <InfoRow label="Battery size" value={`${vehicle.batteryKwh} kWh`} />
                <InfoRow label="Claimed range" value={`${vehicle.claimedRangeKm} km`} />
                <InfoRow label="Motor output" value={`${vehicle.powerKw} kW`} />
                <InfoRow label="Efficiency" value={`${efficiency.toFixed(1)} kWh/100km`} />
                <InfoRow label="Safety buffer" value={`${safetyBuffer.toFixed(0)}%`} />
                <InfoRow label="Wall charging" value={`${wallChargeKw.toFixed(1)} kW`} />
                <InfoRow label="AC charging" value={`${acChargeKw.toFixed(1)} kW`} />
                <InfoRow label="DC charging" value={`${selectedDcChargeKw.toFixed(1)} kW`} />
              </div>
            )}

            {tab === "settings" && (
              <div style={{ display: "grid", gap: 14 }}>
                <SectionCard title="Trip Settings" subtitle="Adjust the planning assumptions used in the trip calculator.">
                  <NumberField label="Efficiency" value={efficiency} setValue={setEfficiency} suffix=" kWh/100km" step="0.1" />
                  <NumberField label="Safety buffer" value={safetyBuffer} setValue={setSafetyBuffer} suffix="%" step="1" />
                </SectionCard>

                <SectionCard title="Charging Speeds" subtitle="Adjust your charging speeds if your setup differs.">
                  <NumberField label="Wall charging speed" value={wallChargeKw} setValue={setWallChargeKw} suffix=" kW" step="0.1" />
                  <NumberField label="AC charging speed" value={acChargeKw} setValue={setAcChargeKw} suffix=" kW" step="0.1" />
                  <NumberField label="Comfort DC charging speed" value={dcChargeKwComfort} setValue={setDcChargeKwComfort} suffix=" kW" step="0.1" />
                  <NumberField label="Dynamic DC charging speed" value={dcChargeKwDynamic} setValue={setDcChargeKwDynamic} suffix=" kW" step="0.1" />
                </SectionCard>

                <SectionCard title="Electricity Costs" subtitle="Enter the electricity rates you are actually paying.">
                  <NumberField label="Wall charging cost" value={wallCostPerKwh} setValue={setWallCostPerKwh} suffix=" R/kWh" step="0.01" />
                  <NumberField label="AC charging cost" value={acCostPerKwh} setValue={setAcCostPerKwh} suffix=" R/kWh" step="0.01" />
                  <NumberField label="DC charging cost" value={dcCostPerKwh} setValue={setDcCostPerKwh} suffix=" R/kWh" step="0.01" />
                </SectionCard>

                <button onClick={resetDefaults} style={primaryButton}>
                  Reset defaults
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScreenShell({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #eaf2ff 0%, #f7f9fc 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 18,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {children}
    </div>
  );
}

function SectionCard({ title, subtitle, children }) {
  return (
    <div style={sectionCard}>
      <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{title}</div>
      <div style={{ marginTop: 4, marginBottom: 16, color: "#64748b", fontSize: 14, lineHeight: 1.5 }}>
        {subtitle}
      </div>
      <div style={{ display: "grid", gap: 16 }}>{children}</div>
    </div>
  );
}

function SliderField({ label, value, onChange, min, max, step = 1, suffix = "" }) {
  return (
    <div>
      <div style={fieldHeader}>
        <span>{label}</span>
        <span style={{ color: "#334155" }}>{value}{suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: "100%" }} />
    </div>
  );
}

function NumberField({ label, value, setValue, suffix = "", step = "0.1" }) {
  const decimals = step === "0.01" ? 2 : step === "1" ? 0 : 1;
  return (
    <div>
      <div style={fieldHeader}>
        <span>{label}</span>
        <span style={{ color: "#334155" }}>{Number(value).toFixed(decimals)}{suffix}</span>
      </div>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => setValue(Number(e.target.value) || 0)}
        style={numberInput}
      />
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={infoRow}>
      <div style={{ color: "#475569", fontSize: 14, paddingRight: 12 }}>{label}</div>
      <div style={{ color: "#0f172a", fontSize: 20, fontWeight: 800, textAlign: "right" }}>{value}</div>
    </div>
  );
}

function WarningCard({ text }) {
  return (
    <div style={tripWarning}>
      <div style={{ fontWeight: 800, marginBottom: 6 }}>Trip warning</div>
      <div style={{ fontSize: 14, lineHeight: 1.5 }}>{text}</div>
    </div>
  );
}

function SpecPill({ text }) {
  return <div style={specPill}>{text}</div>;
}

const bydBadge = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#ef4444",
  color: "white",
  borderRadius: 999,
  width: 54,
  height: 54,
  fontWeight: 800,
  letterSpacing: 1,
  fontSize: 20,
  boxShadow: "0 10px 25px rgba(239,68,68,0.35)",
};

const loginCard = {
  background: "white",
  width: "100%",
  maxWidth: 390,
  borderRadius: 28,
  padding: 26,
  textAlign: "center",
  boxShadow: "0 24px 60px rgba(15,23,42,0.16)",
};

const termsCard = {
  background: "white",
  width: "100%",
  maxWidth: 430,
  maxHeight: "92vh",
  overflowY: "auto",
  borderRadius: 28,
  padding: 22,
  boxShadow: "0 24px 60px rgba(15,23,42,0.16)",
};

const termsTextBox = {
  background: "#f8fafc",
  border: "1px solid rgba(148,163,184,0.25)",
  borderRadius: 18,
  padding: 14,
  fontSize: 13,
  lineHeight: 1.5,
  color: "#334155",
  maxHeight: 360,
  overflowY: "auto",
};

const checkboxRow = {
  display: "flex",
  gap: 10,
  alignItems: "flex-start",
  marginTop: 18,
  marginBottom: 16,
  fontSize: 14,
  color: "#0f172a",
};

const primaryButton = {
  border: "none",
  borderRadius: 18,
  padding: "16px 18px",
  fontWeight: 700,
  fontSize: 15,
  cursor: "pointer",
  background: "#0f172a",
  color: "white",
  boxShadow: "0 12px 24px rgba(15,23,42,0.2)",
  width: "100%",
};

const warningBanner = {
  background: "#fff3cd",
  border: "1px solid #ffeeba",
  color: "#856404",
  padding: "10px 14px",
  borderRadius: 14,
  marginBottom: 12,
  fontSize: 13,
  lineHeight: 1.4,
  boxShadow: "0 8px 20px rgba(133,100,4,0.08)",
};

const darkResultCard = {
  background: "#0f172a",
  color: "white",
  borderRadius: 24,
  padding: 20,
  boxShadow: "0 16px 36px rgba(15,23,42,0.24)",
};

const sectionCard = {
  background: "white",
  borderRadius: 24,
  padding: 18,
  boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
  border: "1px solid rgba(148,163,184,0.12)",
};

const fieldHeader = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 8,
  color: "#0f172a",
  fontWeight: 600,
  fontSize: 14,
};

const numberInput = {
  width: "100%",
  borderRadius: 14,
  border: "1px solid rgba(148,163,184,0.3)",
  padding: "12px 14px",
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
};

const infoRow = {
  background: "#f8fafc",
  borderRadius: 20,
  padding: "16px 18px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  border: "1px solid rgba(148,163,184,0.14)",
};

const tripWarning = {
  background: "#fff1f2",
  border: "1px solid #fecdd3",
  color: "#be123c",
  borderRadius: 20,
  padding: "16px 18px",
  boxShadow: "0 10px 24px rgba(190,18,60,0.08)",
};

const specPill = {
  background: "#eef4ff",
  color: "#183153",
  padding: "12px 14px",
  borderRadius: 14,
  fontWeight: 600,
  fontSize: 14,
};