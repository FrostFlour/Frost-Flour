import { useEffect, useState } from "react";
import { listClients } from "../../api/user.api";
import "./ClientsPage.css";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClients = async () => {
    try {
      const data = await listClients();
      setClients(data.clients || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load client accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchClients();
  };
  
  if (loading) {
    return (
      <div className="clients-page">
        <div className="clients-container">
          <div className="clients-loading">Loading client accounts...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="clients-page">
        <div className="clients-container">
          <div className="clients-error">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={handleRetry} className="clients-retry-button">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="clients-page">
      <div className="clients-container">
        <div className="clients-header">
          <h1>Client Accounts</h1>
          <span className="clients-count">{clients.length} total</span>
        </div>

        {clients.length === 0 ? (
          <div className="clients-empty">
            <p>No client accounts yet.</p>
          </div>
        ) : (
          <div className="clients-card">
            <table className="clients-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client._id}>
                    <td className="client-name">
                      {client.firstName} {client.lastName}
                    </td>
                    <td>{client.email}</td>
                    <td>{client.phone || "-"}</td>
                    <td>{client.address || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
