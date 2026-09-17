export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPPORT_AGENT';
  avatar_url?: string;
  is_active: boolean;
  monthly_income: number;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Account {
  id: string;
  user_id: string;
  account_number: string;
  account_name: string;
  account_type: 'SAVINGS' | 'CHECKING' | 'EMERGENCY_FUND' | 'INVESTMENT';
  balance: number;
  currency: string;
  status: 'ACTIVE' | 'FROZEN' | 'CLOSED';
  is_primary: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  category: string;
  merchant: string;
  payment_method: 'UPI' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CASH';
  description?: string;
  status: 'COMPLETED' | 'PENDING' | 'FLAGGED';
  is_anomaly: boolean;
  anomaly_score: number;
  anomaly_reason?: string;
  is_recurring: boolean;
  ai_confidence: number;
  ai_categorization_reason?: string;
  date: string;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  monthly_limit: number;
  current_spent: number;
  month_year: string;
  alert_threshold: number;
  utilization_percentage: number;
  status: 'Normal' | 'Watch' | 'Near Limit' | 'Exceeded';
  created_at: string;
}

export interface FinancialGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category: string;
  icon?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  progress_percentage: number;
  remaining_amount: number;
  suggested_monthly_saving: number;
  created_at: string;
}

export interface RecurringExpense {
  id: string;
  user_id: string;
  merchant: string;
  category: string;
  estimated_amount: number;
  frequency: string;
  payment_method: string;
  last_billed_date?: string;
  next_due_date: string;
  is_active: boolean;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'BUDGET_ALERT' | 'ANOMALY_WARNING' | 'RECURRING_DUE' | 'GOAL_PROGRESS' | 'SYSTEM_NOTICE';
  is_read: boolean;
  created_at: string;
  metadata_json?: string;
}

export interface AIInsight {
  id: string;
  insight_type: string;
  title: string;
  summary: string;
  explanation_why: string;
  action_suggested?: string;
  impact_score: number;
  created_at: string;
}

export interface AnomalyRecord {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  transaction_id: string;
  anomaly_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  reason: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'FALSE_POSITIVE';
  model_version: string;
  reviewed_by?: string;
  review_notes?: string;
  created_at: string;
  transaction?: {
    amount: number;
    merchant: string;
    category: string;
    date: string;
    payment_method: string;
  };
}

export interface CategoryForecast {
  category: string;
  historical_avg: number;
  forecasted_amount: number;
  trend_percentage: number;
  trend_direction: 'UP' | 'DOWN' | 'STABLE';
  confidence: number;
  explanation: string;
}

export interface ForecastResponse {
  period: string;
  estimated_total_expenses: number;
  historical_monthly_avg: number;
  forecast_change_percentage: number;
  categories: CategoryForecast[];
  methodology: string;
  model_version: string;
  created_at: string;
}

export interface HealthFactorBreakdown {
  name: string;
  score: number;
  weight: number;
  status: string;
  description: string;
}

export interface FinancialHealthResponse {
  overall_score: number;
  rating: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'NEEDS_ATTENTION';
  factors: HealthFactorBreakdown[];
  summary_insight: string;
  improvement_tips: string[];
  calculation_details: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  grounded_data?: any;
  suggested_actions?: string[];
  timestamp: string;
}

export interface KYCRecord {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  document_type: 'AADHAAR' | 'PAN' | 'PASSPORT' | 'VOTER_ID';
  document_number: string;
  extracted_name: string;
  extracted_dob?: string;
  extracted_address?: string;
  ocr_confidence: number;
  status: 'PENDING' | 'PROCESSING' | 'VERIFIED' | 'NEEDS_REVIEW' | 'REJECTED';
  rejection_reason?: string;
  created_at: string;
}

export interface CreditRiskResponse {
  risk_band: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  estimated_score: number;
  income_consistency_score: number;
  repayment_history_score: number;
  expense_ratio_score: number;
  transaction_stability_score: number;
  existing_obligations_score: number;
  key_factors: Array<{
    factor: string;
    score: number;
    rating: string;
    impact: string;
  }>;
  explanation: string;
  max_recommended_credit: number;
  created_at: string;
}

export interface DashboardSummary {
  total_balance: number;
  monthly_income: number;
  monthly_expenses: number;
  net_savings: number;
  savings_rate: number;
  health_score: number;
  active_anomalies_count: number;
  near_limit_budgets_count: number;
  active_goals_count: number;
  upcoming_recurring_total: number;
  recent_transactions: Transaction[];
  top_categories: Array<{ category: string; amount: number; percentage: number }>;
  cash_flow_trend: Array<{ month: string; income: number; expenses: number; savings: number }>;
  budget_utilization: Array<{
    id: string;
    category: string;
    monthly_limit: number;
    current_spent: number;
    utilization_pct: number;
    status: string;
  }>;
  ai_insights: AIInsight[];
}

export interface AdminStatsResponse {
  total_users: number;
  total_accounts: number;
  total_transactions: number;
  total_volume: number;
  open_anomalies_count: number;
  pending_kyc_count: number;
  model_inference_count: number;
  model_accuracy_estimate: number;
  anomaly_detection_rate: number;
  last_trained_timestamp: string;
}
