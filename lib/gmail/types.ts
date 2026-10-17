export interface GmailHeader {
  name?: string;
  value?: string;
}

export interface GmailMessagePart {
  mimeType?: string;
  body?: { data?: string; size?: number };
  parts?: GmailMessagePart[];
  headers?: GmailHeader[];
}

export interface GmailMessage {
  id?: string;
  threadId?: string;
  labelIds?: string[];
  snippet?: string;
  internalDate?: string;
  payload?: GmailMessagePart;
}

export interface GmailListResponse {
  messages?: { id?: string; threadId?: string }[];
  nextPageToken?: string;
  resultSizeEstimate?: number;
}

export interface GoogleTokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  expiry_date?: number;
  error?: string;
  error_description?: string;
}

export interface GoogleUserInfo {
  email?: string;
}
