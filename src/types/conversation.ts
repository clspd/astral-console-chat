// ============================================================
// Schema
// ============================================================

export enum SchemaVersion {
  V1 = 1,
}

// ============================================================
// Message roles & statuses
// ============================================================

export enum MessageRole {
  User = 'USER',
  Assistant = 'ASSISTANT',
  System = 'SYSTEM',
  Tool = 'TOOL',
  ToolResult = 'TOOL_RESULT',
}

export enum MessageStatus {
  Finished = 'FINISHED',
  WIP = 'WIP',
  Error = 'ERROR',
  Interrupted = 'INTERRUPTED',
}

export enum MessageFeedback {
  NotProvided = '',
  Positive = '+',
  Negative = '-',
}

// ============================================================
// Message fragments
// ============================================================

export enum MessageFragmentType {
  TextFragment = 'text',
}

export enum MessageContentType {
  Text = 'text',
}

export type MessageContent<T extends MessageContentType> =
  T extends MessageContentType.Text ? string : never;

export interface MessageFragment {
  id: number;
  type: MessageFragmentType;
  ts: number;
  elapsed?: number;
  first_token_latency?: number;
  contentType: MessageContentType;
  content: MessageContent<this['contentType']>;
}

// ============================================================
// Message features
// ============================================================

export enum MessageFeatureType {
  Thinking = 'thinking',
  MaxTokensLimit = 'max_tokens_limit',
  BanEdit = 'ban_edit',
  BanRegenerate = 'ban_regenerate',
}

export type MessageFeatureValue = boolean | string | number;

export interface MessageFeatureItem {
  type: MessageFeatureType;
  value: MessageFeatureValue;
}

// ============================================================
// Attachments & usage
// ============================================================

export interface FileAttachmentInfo {
  id: string;
  name: string;
  type: string;
  size: number;
  hash: string;
  path: string;
}

export interface MessageUsage {
  total_tokens: number;
}

// ============================================================
// Message
// ============================================================

export interface Message {
  id: number;
  parent_id: number | null;
  role: MessageRole;
  ts: number;

  features?: MessageFeatureItem[];
  feedback?: MessageFeedback;
  usage?: MessageUsage;

  status: MessageStatus;
  files: FileAttachmentInfo[];
  fragments: MessageFragment[];
  has_pending_fragment: boolean;
}

// ============================================================
// MessageContainer
// ============================================================

export interface MessageContainer {
  name: string;
  content: Message[];
}

// ============================================================
// Conversation
// ============================================================

export interface ConversationStatus {
  created_at: number;
  updated_at: number;
}

export interface Conversation {
  schemaVersion: SchemaVersion;
  appid: string;
  name: string;
  stat: ConversationStatus;
  history: MessageContainer[];
  content: MessageContainer;
}
