export interface ChatMessage {
  id: string;
  username: string;
  text: string;
  timestamp: string;
  isSelf?: boolean;
  isSystem?: boolean;
  confidence?: number;
}

export interface BlockedWarning {
  warning_title: string;
  warning_message: string;
  original_text: string;
  confidence: number;
  cleaned_text?: string;
  timestamp: string;
}

export interface PredictionResponse {
  original_text: string;
  cleaned_text: string;
  is_bullying: boolean;
  confidence: number;
  label: string;
  threshold: number;
  error?: string | null;
}

export interface HealthResponse {
  status: string;
  service: string;
  model_loaded: boolean;
  tokenizer_loaded: boolean;
  vocab_size: number;
  threshold: number;
}
