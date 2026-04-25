import { useMemo, useState } from "react";
import carImage from "./assets/dolphin.png";

const VEHICLES = {
  comfort: {
    name: "BYD Dolphin Surf Comfort",
    shortName: "Comfort",
    batteryKwh: 30.0,
    claimedRangeKm: 232,
    powerKw: 55,
    dcChargeKw: 30,
    acChargeKw: 7,
    wallChargeKw: 2.3,
    wallCostPerKwh: 3.25,
    acCostPerKwh: 3.85,
    dcCostPerKwh: 6.75,
    notes: [
      "30.0 kWh Blade Battery",
      "232 km WLTP claimed range",
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
    dcChargeKw: 40,
    acChargeKw: 7,
    wallChargeKw: 2.3,
    wallCostPerKwh: 3.25,
    acCostPerKwh: 3.85,
    dcCostPerKwh: 6.75,
    notes: [
      "38.8 kWh Blade Battery",
      "295 km WLTP claimed range",
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

export default function App() {
  const [tab, setTab] = useState("calculator");
  const [selectedVehicle, setSelectedVehicle] = useState("dynamic");
  const [chargeType, setChargeType] = useState("wall");

  const [batteryPercent, setBatteryPercent] = useState(80);
  const [tripDistance, setTripDistance] = useState(120);
  const [efficiency, setEfficiency] = useState(14.8);
  const [chargeStart, setChargeStart] = useState(20);
  const [chargeTarget, setChargeTarget] = useState(80);
  const [buffer, setBuffer] = useState(10);

  const vehicle = VEHICLES[selectedVehicle];
  const batterySize = vehicle.batteryKwh;

  const selectedChargePower = useMemo(() => {
    if (chargeType === "wall") return vehicle.wallChargeKw;
    if (chargeType === "ac") return vehicle.acChargeKw;
    return vehicle.dcChargeKw;
  }, [chargeType, vehicle]);

  const costPerKwh = useMemo(() => {
    if (chargeType === "wall") return vehicle.wallCostPerKwh;
    if (chargeType === "ac") return vehicle.acCostPerKwh;
    return vehicle.dcCostPerKwh;
  }, [chargeType, vehicle]);

  const availableRange = useMemo(() => {
    const usableKwh = (batteryPercent / 100) * batterySize;
    return (usableKwh / efficiency) * 100;
  }, [batteryPercent, batterySize, efficiency]);

  const tripUse = useMemo(() => {
    return (tripDistance * efficiency) / 100;
  }, [tripDistance, efficiency]);

  const remainingBattery = useMemo(() => {
    const usedPercent = (tripUse / batterySize) * 100;
    return Math.max(batteryPercent - usedPercent, 0);
  }, [tripUse, batterySize, batteryPercent]);

  const recommendedStart = useMemo(() => {
    const requiredKwh = (tripDistance * efficiency) / 100;
    const requiredPercent = (requiredKwh / batterySize) * 100;
    return Math.min(Math.ceil(requiredPercent + buffer), 100);
  }, [tripDistance, efficiency, batterySize, buffer]);

  const energyNeededToCharge = useMemo(() => {
    if (chargeTarget <= chargeStart) return 0;
    return ((chargeTarget - chargeStart) / 100) * batterySize;
  }, [chargeStart, chargeTarget, batterySize]);

  const chargeTimeHours = useMemo(() => {
    if (selectedChargePower <= 0 || chargeTarget <= chargeStart) return 0;
    return energyNeededToCharge / selectedChargePower;
  }, [selectedChargePower, chargeTarget, chargeStart, energyNeededToCharge]);

  const chargeTimeMinutes = Math.round(chargeTimeHours * 60);

  const estimatedChargeCost = useMemo(() => {
    return energyNeededToCharge * costPerKwh;
  }, [energyNeededToCharge, costPerKwh]);

  const statCards = [
    {
      label: "Battery size",
      value: `${vehicle.batteryKwh} kWh`,
    },
    {
      label: "Claimed range",
      value: `${vehicle.claimedRangeKm} km`,
    },
    {
      label: "Motor output",
      value: `${vehicle.powerKw} kW`,
    },
    {
      label: "Charge type",
      value: CHARGE_TYPES.find((item) => item.key === chargeType)?.label || "Wall",
    },
  ];

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
      <div
        style={{
          width: "100%",
          maxWidth: 430,
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
            <div
              style={{
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
              }}
            >
              BYD
            </div>

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
            <div
              style={{
                display: "flex",
                gap: 10,
                marginBottom: 14,
              }}
            >
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

            <div
              style={{
                fontSize: 13,
                opacity: 0.8,
                marginBottom: 10,
                letterSpacing: 0.4,
              }}
            >
              EV Range and Charge Companion
            </div>

            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                lineHeight: 1.1,
                marginBottom: 16,
              }}
            >
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
                src={carImage}
                alt={vehicle.name}
                style={{
                  maxWidth: "100%",
                  maxHeight: 190,
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 12,
              }}
            >
              {statCards.map((card) => (
                <div
                  key={card.label}
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    borderRadius: 18,
                    padding: 14,
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div style={{ fontSize: 12, opacity: 0.76, marginBottom: 6 }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>
                    {card.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: 18 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10,
              marginBottom: 18,
            }}
          >
            {[
              { key: "calculator", label: "Trip" },
              { key: "charging", label: "Charge" },
              { key: "specs", label: "Specs" },
            ].map((item) => {
              const active = tab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setTab(item.key)}
                  style={{
                    border: "none",
                    borderRadius: 16,
                    padding: "14px 10px",
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

          {tab === "calculator" && (
            <div style={{ display: "grid", gap: 14 }}>
              <SectionCard
                title="Trip Calculator"
                subtitle={`Calculations are based on the ${vehicle.shortName} model.`}
              >
                <SliderField
                  label="Current battery"
                  value={batteryPercent}
                  suffix="%"
                  min={0}
                  max={100}
                  onChange={setBatteryPercent}
                />
                <SliderField
                  label="Trip distance"
                  value={tripDistance}
                  suffix=" km"
                  min={10}
                  max={500}
                  onChange={setTripDistance}
                />
                <SliderField
                  label="Efficiency"
                  value={efficiency}
                  suffix=" kWh/100km"
                  min={10}
                  max={25}
                  step={0.1}
                  onChange={setEfficiency}
                />
                <SliderField
                  label="Safety buffer"
                  value={buffer}
                  suffix="%"
                  min={0}
                  max={30}
                  step={1}
                  onChange={setBuffer}
                />
              </SectionCard>

              <InfoRow
                label="Estimated available range"
                value={`${Math.round(availableRange)} km`}
              />
              <InfoRow
                label="Energy needed for trip"
                value={`${tripUse.toFixed(1)} kWh`}
              />
              <InfoRow
                label="Battery expected after trip"
                value={`${remainingBattery.toFixed(0)}%`}
              />
              <InfoRow
                label="Suggested battery before trip"
                value={`${recommendedStart}%`}
              />
            </div>
          )}

          {tab === "charging" && (
            <div style={{ display: "grid", gap: 14 }}>
              <SectionCard
                title="Charging Estimate"
                subtitle="Choose the charging method you want to use."
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 10,
                  }}
                >
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
                          boxShadow: active
                            ? "0 12px 24px rgba(15,23,42,0.18)"
                            : "inset 0 0 0 1px rgba(148,163,184,0.16)",
                        }}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <SliderField
                  label="Charge start"
                  value={chargeStart}
                  suffix="%"
                  min={0}
                  max={100}
                  onChange={setChargeStart}
                />
                <SliderField
                  label="Charge target"
                  value={chargeTarget}
                  suffix="%"
                  min={0}
                  max={100}
                  onChange={setChargeTarget}
                />
              </SectionCard>

              <div
                style={{
                  background: "#0f172a",
                  color: "white",
                  borderRadius: 24,
                  padding: 20,
                  boxShadow: "0 16px 36px rgba(15,23,42,0.24)",
                }}
              >
                <div style={{ fontSize: 13, opacity: 0.72, marginBottom: 8 }}>
                  Estimated charging time
                </div>
                <div style={{ fontSize: 34, fontWeight: 800 }}>
                  {chargeTarget <= chargeStart
                    ? "Set target above start"
                    : `${chargeTimeMinutes} min`}
                </div>
                <div style={{ marginTop: 8, fontSize: 13, opacity: 0.74 }}>
                  Based on {vehicle.batteryKwh} kWh battery using{" "}
                  {selectedChargePower} kW charging.
                </div>
              </div>

              <InfoRow
                label="Energy to add"
                value={`${energyNeededToCharge.toFixed(1)} kWh`}
              />
              <InfoRow
                label="Cost per kWh"
                value={`R${costPerKwh.toFixed(2)}`}
              />
              <InfoRow
                label="Estimated charging cost"
                value={`R${estimatedChargeCost.toFixed(2)}`}
              />
            </div>
          )}

          {tab === "specs" && (
            <div style={{ display: "grid", gap: 14 }}>
              <SectionCard
                title={`${vehicle.shortName} model details`}
                subtitle="Core differences used in the app"
              >
                {vehicle.notes.map((note) => (
                  <SpecPill key={note} text={note} />
                ))}
              </SectionCard>

              <InfoRow label="Battery size" value={`${vehicle.batteryKwh} kWh`} />
              <InfoRow
                label="Claimed WLTP range"
                value={`${vehicle.claimedRangeKm} km`}
              />
              <InfoRow label="Motor output" value={`${vehicle.powerKw} kW`} />
              <InfoRow
                label="Wall charging"
                value={`${vehicle.wallChargeKw} kW`}
              />
              <InfoRow label="AC charging" value={`${vehicle.acChargeKw} kW`} />
              <InfoRow label="DC charging" value={`${vehicle.dcChargeKw} kW`} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, children }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 24,
        padding: 18,
        boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
        border: "1px solid rgba(148,163,184,0.12)",
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>
        {title}
      </div>
      <div
        style={{
          marginTop: 4,
          marginBottom: 16,
          color: "#64748b",
          fontSize: 14,
          lineHeight: 1.5,
        }}
      >
        {subtitle}
      </div>
      <div style={{ display: "grid", gap: 16 }}>{children}</div>
    </div>
  );
}

function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix = "",
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
          color: "#0f172a",
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        <span>{label}</span>
        <span style={{ color: "#334155" }}>
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%" }}
      />
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        background: "#f8fafc",
        borderRadius: 20,
        padding: "16px 18px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        border: "1px solid rgba(148,163,184,0.14)",
      }}
    >
      <div style={{ color: "#475569", fontSize: 14 }}>{label}</div>
      <div style={{ color: "#0f172a", fontSize: 20, fontWeight: 800 }}>
        {value}
      </div>
    </div>
  );
}

function SpecPill({ text }) {
  return (
    <div
      style={{
        background: "#eef4ff",
        color: "#183153",
        padding: "12px 14px",
        borderRadius: 14,
        fontWeight: 600,
        fontSize: 14,
      }}
    >
      {text}
    </div>
  );
}