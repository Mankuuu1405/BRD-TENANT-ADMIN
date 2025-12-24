import { useEffect, useState, useMemo } from "react";
import { calendarAPI } from "../services/calendarService"; // ensure this is correct

export default function Calendar() {
  // -------------------- STATES --------------------
  const [financialYears, setFinancialYears] = useState([]);
  const [reportingPeriods, setReportingPeriods] = useState([]);
  const [holidays, setHolidays] = useState([]);

  const [modals, setModals] = useState({ fy: false, rp: false, h: false });

  const [fyForm, setFyForm] = useState({
    name: "",
    start: "",
    end: "",
    status: "Active",
  });
  const [rpForm, setRpForm] = useState({ name: "", start: "", end: "" });
  const [hForm, setHForm] = useState({ title: "", date: "" });

  // -------------------- COUNTS --------------------
  const fyCounts = useMemo(
    () => ({
      Active: financialYears.filter((f) => f.is_active).length,
      Inactive: financialYears.filter((f) => !f.is_active).length,
    }),
    [financialYears]
  );

  const statusBadge = (s) =>
    s
      ? "inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800"
      : "inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800";

  // -------------------- FETCH ALL DATA --------------------
  useEffect(() => {
    loadFinancialYears();
    loadReportingPeriods();
    loadHolidays();
  }, []);

  const loadFinancialYears = () => {
    calendarAPI
      .getFinancialYears()
      .then((res) => setFinancialYears(res.data))
      .catch((err) => console.error("Error loading FY:", err));
  };

  const loadReportingPeriods = () => {
    calendarAPI
      .getReportingPeriods()
      .then((res) => setReportingPeriods(res.data))
      .catch((err) => console.error("Error loading RP:", err));
  };

  const loadHolidays = () => {
    calendarAPI
      .getHolidays()
      .then((res) => setHolidays(res.data))
      .catch((err) => console.error("Error loading holidays:", err));
  };

  // -------------------- CREATE OPERATIONS --------------------
  const saveFinancialYear = () => {
    if (!fyForm.name || !fyForm.start || !fyForm.end) {
      alert("Please fill all fields");
      return;
    }

    const payload = {
      name: fyForm.name,
      start: fyForm.start,
      end: fyForm.end,
      is_active: fyForm.status === "Active",
    };
    

    calendarAPI
      .createFinancialYear(payload)
      .then((res) => {
        setFinancialYears([...financialYears, res.data]);
        setModals((m) => ({ ...m, fy: false }));
      })
      .catch((err) => {
        console.error("FY create error:", err);
        if (err.response) console.error("Backend response:", err.response.data);
      });
  };

  const saveReportingPeriod = () => {
    if (!rpForm.name || !rpForm.start || !rpForm.end) {
      alert("Please fill all fields");
      return;
    }

    const payload = {
      name: rpForm.name,
      start: rpForm.start,
      end: rpForm.end,
    };

    calendarAPI
      .createReportingPeriod(payload)
      .then((res) => {
        setReportingPeriods([...reportingPeriods, res.data]);
        setModals((m) => ({ ...m, rp: false }));
      })
      .catch((err) => console.error("RP create error:", err));
  };

  const saveHoliday = () => {
    if (!hForm.title || !hForm.date) {
      alert("Please fill all fields");
      return;
    }

    const payload = { title: hForm.title, date: hForm.date };

    calendarAPI
      .createHoliday(payload)
      .then((res) => {
        setHolidays([...holidays, res.data]);
        setModals((m) => ({ ...m, h: false }));
      })
      .catch((err) => console.error("Holiday create error:", err));
  };

  // -------------------- DELETE OPERATIONS --------------------
  const deleteReportingPeriod = (id) => {
    calendarAPI
      .deleteReportingPeriod(id)
      .then(() =>
        setReportingPeriods(reportingPeriods.filter((r) => r.id !== id))
      )
      .catch((err) => console.error("RP delete error:", err));
  };

  const deleteHoliday = (id) => {
    calendarAPI
      .deleteHoliday(id)
      .then(() => setHolidays(holidays.filter((h) => h.id !== id)))
      .catch((err) => console.error("Holiday delete error:", err));
  };

  // -------------------- UI --------------------
  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800">Calendar</h1>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* FINANCIAL YEARS */}
        <section className="bg-white rounded-xl shadow-md border p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-700">
              Financial Years
            </h2>
            <button
              className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={() => {
                setFyForm({ name: "", start: "", end: "", status: "Active" });
                setModals((m) => ({ ...m, fy: true }));
              }}
            >
              Add
            </button>
          </div>

          <div className="text-sm text-gray-600 mb-2">
            Active: {fyCounts.Active} • Inactive: {fyCounts.Inactive}
          </div>

          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2">Name</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {financialYears.map((f) => (
                <tr key={f.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 font-medium">{f.name}</td>
                  <td>{f.start}</td>
                  <td>{f.end}</td>
                  <td>
                    <span className={statusBadge(f.is_active)}>
                      {f.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* REPORTING PERIODS */}
        <section className="bg-white rounded-xl shadow-md border p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-gray-700">Reporting Periods</h2>
            <button
              className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={() => {
                setRpForm({ name: "", start: "", end: "" });
                setModals((m) => ({ ...m, rp: true }));
              }}
            >
              Add
            </button>
          </div>

          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2">Name</th>
                <th>Start</th>
                <th>End</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reportingPeriods.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 font-medium">{r.name}</td>
                  <td>{r.start}</td>
                  <td>{r.end}</td>
                  <td>
                    <button
                      className="px-3 py-1 border rounded-lg text-red-600 hover:bg-red-50"
                      onClick={() => deleteReportingPeriod(r.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* HOLIDAYS */}
        <section className="bg-white rounded-xl shadow-md border p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-gray-700">Holidays</h2>
            <button
              className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={() => {
                setHForm({ title: "", date: "" });
                setModals((m) => ({ ...m, h: true }));
              }}
            >
              Add
            </button>
          </div>

          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2">Date</th>
                <th>Title</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((h) => (
                <tr key={h.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{h.date}</td>
                  <td className="font-medium">{h.title}</td>
                  <td>
                    <button
                      className="px-3 py-1 border rounded-lg text-red-600 hover:bg-red-50"
                      onClick={() => deleteHoliday(h.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {/* -------------------- MODALS -------------------- */}
      {modals.fy && (
        <FormModal
          title="Add Financial Year"
          form={fyForm}
          setForm={setFyForm}
          onClose={() => setModals((m) => ({ ...m, fy: false }))}
          onSave={saveFinancialYear}
          fields={["name", "start", "end", "status"]}
        />
      )}
      {modals.rp && (
        <FormModal
          title="Add Reporting Period"
          form={rpForm}
          setForm={setRpForm}
          onClose={() => setModals((m) => ({ ...m, rp: false }))}
          onSave={saveReportingPeriod}
          fields={["name", "start", "end"]}
        />
      )}
      {modals.h && (
        <FormModal
          title="Add Holiday"
          form={hForm}
          setForm={setHForm}
          onClose={() => setModals((m) => ({ ...m, h: false }))}
          onSave={saveHoliday}
          fields={["title", "date"]} // <-- include 'date' here
        />
      )}
    </div>
  );
}

/* -------------------- MODAL COMPONENT -------------------- */
function FormModal({ title, form, setForm, onClose, onSave, fields }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">{title}</h3>

        {fields.includes("name") && (
          <label className="block mb-3">
            Name
            <input
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full h-10 border rounded-lg px-3"
            />
          </label>
        )}

        {fields.includes("title") && (
          <label className="block mb-3">
            Title
            <input
              value={form.title || ""}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1 w-full h-10 border rounded-lg px-3"
            />
          </label>
        )}

        {fields.includes("date") && (
          <label className="block mb-3">
            Date
            <input
              type="date"
              value={form.date || ""}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="mt-1 w-full h-10 border rounded-lg px-3"
            />
          </label>
        )}

        {fields.includes("start") && (
          <label className="block mb-3">
            Start
            <input
              type="date"
              value={form.start || ""}
              onChange={(e) => setForm({ ...form, start: e.target.value })}
              className="mt-1 w-full h-10 border rounded-lg px-3"
            />
          </label>
        )}

        {fields.includes("end") && (
          <label className="block mb-3">
            End
            <input
              type="date"
              value={form.end || ""}
              onChange={(e) => setForm({ ...form, end: e.target.value })}
              className="mt-1 w-full h-10 border rounded-lg px-3"
            />
          </label>
        )}

        {fields.includes("status") && (
          <label className="block mb-3">
            Status
            <select
              value={form.status || "Active"}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="mt-1 w-full h-10 border rounded-lg px-3"
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </label>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <button
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={onSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
