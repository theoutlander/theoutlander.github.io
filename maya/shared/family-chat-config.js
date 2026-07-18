/**
 * Family-chat connection config — the single source of truth shared by the chat
 * widget (family-chat.js) and the widget-free poster (family-post.js).
 * Importing family-chat.js would auto-mount the whole widget, so config lives here
 * to keep the poster lightweight.
 */
export const CHAT_CFG = {
	supabaseUrl: 'https://mqmkktxaqmgqbdogozuu.supabase.co',
	supabaseAnonKey:
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xbWtrdHhhcW1ncWJkb2dvenV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxOTA4ODIsImV4cCI6MjA5NTc2Njg4Mn0.agbC0-xB0jeetK5i6huDm87O3rDOwqdb4fRvEmNDPYU',
	authUrl:
		'https://mqmkktxaqmgqbdogozuu.supabase.co/functions/v1/family-chat-auth',
};
export const CHAT_TABLE = 'maya_chat_messages';
export const CHAT_SESSION_KEY = 'maya_family_chat_v3';
