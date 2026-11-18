// US-08: form used by an Agent to create another Agent account.
import { useState } from "react";
import { createAgent } from "../../api/user.api";

// Empty form (used at the start and after a success)
const emptyForm = { firstName: "", lastName: "", email: "", phone: "", password: "" };

export default function CreateAgentPage() {
  // "state" = data that React remembers; changing it re-draws the page
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Called each time the user types in an input.
  // e.target.name is "firstName", "email"... so one function updates every field.
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // stop the browser from reloading the page
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Send the data to POST /api/users/agents
      const data = await createAgent(form);
      setSuccess(`Agent account created for ${data.user.email}`);
      setForm(emptyForm); // clear the form
    } catch (err) {
      // The message comes from the back end ("email is not valid", ...).
      // The fields are kept so the agent can fix the mistake.
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="agent-page">
      <h1>Add a bakery agent</h1>
      <p className="agent-subtitle">Bakery workspace</p>

      <div className="agent-columns">
        <div className="agent-card">
          {error && <p className="agent-msg error">{error}</p>}
          {success && <p className="agent-msg success">{success}</p>}

          <form className="agent-form" onSubmit={handleSubmit}>
            <div className="agent-row">
              <label>
                First name
                <input name="firstName" value={form.firstName} onChange={handleChange} required />
              </label>
              <label>
                Last name
                <input name="lastName" value={form.lastName} onChange={handleChange} required />
              </label>
            </div>

            <label>
              Email
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </label>

            <label>
              Phone
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} required />
            </label>

            <label>
              Temporary password
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                minLength={8}
                required
              />
              <span className="agent-hint">At least 8 characters</span>
            </label>

            <div className="agent-buttons">
              <button type="submit" className="agent-btn" disabled={loading}>
                {loading ? "Creating..." : "Create Agent account"}
              </button>
            </div>
          </form>
        </div>

        <aside className="agent-info">
          <h3>Bakery team access</h3>
          <p>This account will have the Agent role and can manage products, categories and orders.</p>
          <p>Only an existing agent can add staff.</p>
        </aside>
      </div>
    </section>
  );
}
