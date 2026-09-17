import {
  AuthResponse,
  User,
  Account,
  Transaction,
  Budget,
  FinancialGoal,
  RecurringExpense,
  NotificationItem,
  AIInsight,
  AnomalyRecord,
  ForecastResponse,
  FinancialHealthResponse,
  KYCRecord,
  CreditRiskResponse,
  DashboardSummary,
  AdminStatsResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('smartbank_token');
  }

  private setToken(token: string) {
    localStorage.setItem('smartbank_token', token);
  }

  public clearToken() {
    localStorage.removeItem('smartbank_token');
    localStorage.removeItem('smartbank_user');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    const url = `${API_BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        // Clear session if unauthorized on protected endpoint
        if (!endpoint.includes('/api/auth/login')) {
          this.clearToken();
        }
      }

      if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          // fallback to status text
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error: any) {
      console.error(`API Request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // --- Auth ---
  async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(data.access_token);
    localStorage.setItem('smartbank_user', JSON.stringify(data.user));
    return data;
  }

  async register(payload: { email: string; full_name: string; password: string; phone?: string }): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(data.access_token);
    localStorage.setItem('smartbank_user', JSON.stringify(data.user));
    return data;
  }

  async demoLogin(role: 'CUSTOMER' | 'ADMIN' = 'CUSTOMER'): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>(`/api/auth/demo-login?role=${role}`, {
      method: 'POST',
    });
    this.setToken(data.access_token);
    localStorage.setItem('smartbank_user', JSON.stringify(data.user));
    return data;
  }

  async getProfile(): Promise<User> {
    return this.request<User>('/api/auth/me');
  }

  // --- Dashboard ---
  async getDashboardSummary(): Promise<DashboardSummary> {
    return this.request<DashboardSummary>('/api/dashboard');
  }

  // --- Accounts ---
  async getAccounts(): Promise<Account[]> {
    return this.request<Account[]>('/api/accounts');
  }

  async createAccount(payload: { account_name: string; account_type: string; initial_balance: number }): Promise<Account> {
    return this.request<Account>('/api/accounts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async transferFunds(payload: {
    source_account_id: string;
    destination_account_id?: string;
    destination_account_number?: string;
    amount: number;
    description?: string;
  }): Promise<{ success: boolean; message: string; source_new_balance: number }> {
    return this.request('/api/accounts/transfer', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- Transactions ---
  async getTransactions(params: {
    category?: string;
    type?: string;
    account_id?: string;
    is_anomaly?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<Transaction[]> {
    const query = new URLSearchParams();
    if (params.category) query.append('category', params.category);
    if (params.type) query.append('type', params.type);
    if (params.account_id) query.append('account_id', params.account_id);
    if (params.is_anomaly !== undefined) query.append('is_anomaly', String(params.is_anomaly));
    if (params.search) query.append('search', params.search);
    if (params.limit) query.append('limit', String(params.limit));
    if (params.offset) query.append('offset', String(params.offset));

    const qs = query.toString();
    return this.request<Transaction[]>(`/api/transactions${qs ? `?${qs}` : ''}`);
  }

  async createTransaction(payload: {
    account_id: string;
    amount: number;
    type: string;
    category?: string;
    merchant: string;
    payment_method: string;
    description?: string;
    date?: string;
  }): Promise<Transaction> {
    return this.request<Transaction>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateTransaction(id: string, payload: Partial<Transaction>): Promise<Transaction> {
    return this.request<Transaction>(`/api/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteTransaction(id: string): Promise<{ success: boolean }> {
    return this.request(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Budgets ---
  async getBudgets(): Promise<Budget[]> {
    return this.request<Budget[]>('/api/budgets');
  }

  async createOrUpdateBudget(payload: { category: string; monthly_limit: number; alert_threshold?: number }): Promise<Budget> {
    return this.request<Budget>('/api/budgets', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async deleteBudget(id: string): Promise<{ success: boolean }> {
    return this.request(`/api/budgets/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Financial Goals ---
  async getGoals(): Promise<FinancialGoal[]> {
    return this.request<FinancialGoal[]>('/api/goals');
  }

  async createGoal(payload: {
    name: string;
    target_amount: number;
    initial_amount?: number;
    target_date: string;
    category?: string;
    icon?: string;
  }): Promise<FinancialGoal> {
    return this.request<FinancialGoal>('/api/goals', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async contributeGoal(goalId: string, payload: { amount: number; account_id: string }): Promise<{ success: boolean; new_goal_amount: number; progress_percentage: number }> {
    return this.request(`/api/goals/${goalId}/contribute`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- Recurring Expenses ---
  async getRecurring(): Promise<RecurringExpense[]> {
    return this.request<RecurringExpense[]>('/api/recurring');
  }

  async toggleRecurring(id: string): Promise<{ success: boolean; is_active: boolean }> {
    return this.request(`/api/recurring/${id}/toggle`, {
      method: 'PATCH',
    });
  }

  // --- AI Intelligence ---
  async getForecast(): Promise<ForecastResponse> {
    return this.request<ForecastResponse>('/api/ai/forecast');
  }

  async getFinancialHealth(): Promise<FinancialHealthResponse> {
    return this.request<FinancialHealthResponse>('/api/ai/financial-health');
  }

  async getInsights(): Promise<AIInsight[]> {
    return this.request<AIInsight[]>('/api/ai/insights');
  }

  async getAnomalies(statusFilter?: string): Promise<AnomalyRecord[]> {
    const qs = statusFilter ? `?status_filter=${statusFilter}` : '';
    return this.request<AnomalyRecord[]>(`/api/ai/anomalies${qs}`);
  }

  async reviewAnomaly(anomalyId: string, payload: { status: string; review_notes?: string }): Promise<{ success: boolean; status: string }> {
    return this.request(`/api/ai/anomalies/${anomalyId}/review`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async categorizeMerchant(merchant: string, description?: string, amount?: number): Promise<{ category: string; confidence: number; reason: string }> {
    return this.request('/api/ai/categorize', {
      method: 'POST',
      body: JSON.stringify({ merchant, description, amount }),
    });
  }

  async checkAnomaly(payload: { amount: number; category: string; merchant: string }): Promise<{ is_anomaly: boolean; anomaly_score: number; risk_level: string; reason: string }> {
    return this.request('/api/ai/check-anomaly', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async chatAssistant(message: string): Promise<{ reply: string; grounded_data?: any; suggested_actions?: string[]; mode: string }> {
    return this.request('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // --- KYC Demo ---
  async getKYCStatus(): Promise<KYCRecord[]> {
    return this.request<KYCRecord[]>('/api/kyc/status');
  }

  async submitKYC(payload: { document_type: string; document_number: string; extracted_name: string; extracted_dob?: string; extracted_address?: string }): Promise<KYCRecord> {
    return this.request<KYCRecord>('/api/kyc/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- Credit Risk Demo ---
  async analyzeCreditRisk(payload: { monthly_income?: number; requested_loan_amount?: number; loan_tenure_months?: number } = {}): Promise<CreditRiskResponse> {
    return this.request<CreditRiskResponse>('/api/credit-risk/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- Reports ---
  async getMonthlyReport(monthYear?: string): Promise<any> {
    const qs = monthYear ? `?month_year=${monthYear}` : '';
    return this.request(`/api/reports/monthly${qs}`);
  }

  getExportCSVUrl(): string {
    return `${API_BASE_URL}/api/reports/export/csv`;
  }

  // --- Notifications ---
  async getNotifications(): Promise<NotificationItem[]> {
    return this.request<NotificationItem[]>('/api/notifications');
  }

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return this.request(`/api/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return this.request('/api/notifications/read-all', {
      method: 'POST',
    });
  }

  // --- Admin Risk Center ---
  async getAdminStats(): Promise<AdminStatsResponse> {
    return this.request<AdminStatsResponse>('/api/admin/stats');
  }

  async getAdminUsers(search?: string): Promise<any[]> {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request<any[]>(`/api/admin/users${qs}`);
  }

  async getFraudQueue(statusFilter?: string): Promise<any[]> {
    const qs = statusFilter ? `?status_filter=${statusFilter}` : '';
    return this.request<any[]>(`/api/admin/fraud${qs}`);
  }

  async getAdminKYC(statusFilter?: string): Promise<any[]> {
    const qs = statusFilter ? `?status_filter=${statusFilter}` : '';
    return this.request<any[]>(`/api/admin/kyc${qs}`);
  }

  async getModelMonitoring(): Promise<any> {
    return this.request<any>('/api/admin/models');
  }
}

export const api = new ApiService();
