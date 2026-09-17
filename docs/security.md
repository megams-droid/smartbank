# 🔒 SmartBank AI — Security Architecture, Privacy & Compliance

## 1. Authentication & Session Security

- **Password Hashing**: Passwords are never stored in plaintext. They are salted and hashed using **bcrypt** with standard computational work factor.
- **Token-Based Authorization**: High-entropy **JSON Web Tokens (JWT)** signed via HMAC-SHA256 (`HS256`).
- **Token Expiry**: Configurable TTL (default: 24 hours), rejected immediately upon invalid signature or expiration.
- **Protected Endpoints**: Dependency-injected authorization middleware (`get_current_user`, `get_current_admin`) protects customer data and administrative routes.

---

## 2. Role-Based Access Control (RBAC)

SmartBank AI enforces strict separation of privileges across three primary roles:

| Role | Permissions |
| :--- | :--- |
| `CUSTOMER` | View/manage personal accounts, execute transactions, view AI insights, configure personal budgets/goals, access Assistant. |
| `ADMIN` | Access Admin Risk Center, review/resolve flagged fraud anomalies, inspect KYC submissions, monitor model metrics and audit logs. |
| `SUPPORT_AGENT` | Read-only access to customer support queues and verification inquiries. |

---

## 3. Data Privacy & Financial Safety Guardrails

1. **Zero Real Banking Credentials**: SmartBank AI operates entirely with simulated accounts and synthetic transaction records. The system never requests, processes, or stores real bank passwords, PINs, or card CVVs.
2. **Deterministic Fallbacks**: AI services operate reliably in offline / hybrid mode without sending customer data to unverified external cloud endpoints unless explicitly configured by the deployment environment.
3. **Audit Trail**: Every significant administrative state change (e.g. reviewing an anomaly from `OPEN` to `RESOLVED`) is recorded in `audit_logs` with actor ID, timestamp, entity reference, and client IP address.

---

## 4. Compliance Disclaimer

> **IMPORTANT DISCLAIMER**  
> *SmartBank AI is a demonstration FinTech intelligence prototype built using synthetic and simulated financial data. It does not connect to real banking networks, initiate real money transfers, or provide professional financial, legal, credit underwriting, or investment advice.*
