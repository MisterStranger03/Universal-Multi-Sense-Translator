
export interface ActionSuggestion {
  id: string;
  label: string;
  confidence: number;
}

export interface PerceptionModuleOutput {
  sign_translation?: {
    text: string;
    confidence: number;
  };
  emotion?: {
    label: string;
    confidence: number;
  };
  sound_events?: Array<{
    label: string;
    confidence: number;
  }>;
  object_detections?: Array<{
    label: string;
    confidence: number;
  }>;
}

export interface OrchestratorOutput {
  timestamp_utc: string;
  message: string;
  intent: string;
  actions: ActionSuggestion[];
  perceptions: PerceptionModuleOutput;
  overall_confidence: number;
  clarifying_question: string | null;
  explanations?: string; // Human readable
  logic_trace?: string; // For audit/explainability
  privacy: {
    processed_on_device: boolean;
    audio_recording_consent: boolean;
  };
}

export interface TimelineEvent {
  id: string;
  timestamp: Date;
  type: 'perception' | 'orchestration' | 'action' | 'correction';
  summary: string;
  details?: any;
}

export interface UserSettings {
  targetLanguage: string;
  culturalContext: string;
  autoEmergency: boolean;
}

export enum AppState {
  IDLE = 'IDLE',
  CAPTURING = 'CAPTURING',
  PERCEIVING = 'PERCEIVING',
  ORCHESTRATING = 'ORCHESTRATING',
  ERROR = 'ERROR'
}
