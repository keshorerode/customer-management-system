import { google } from 'googleapis';
import { AppDataSource } from '../data-source';
import { GmailAuth } from '../entities/GmailAuth';
import { GmailThread } from '../entities/GmailThread';
import { Lead } from '../entities/Lead';
import fs from 'fs';
import path from 'path';

const KEY_PATH = path.join(__dirname, '../../../client_secret_585013178295-lvia76oaig6un6s0vur3btgo8niuacsj.apps.googleusercontent.com.json');

export class GmailService {
    private oauth2Client;

    constructor() {
        const credentials = JSON.parse(fs.readFileSync(KEY_PATH, 'utf8')).web;
        this.oauth2Client = new google.auth.OAuth2(
            credentials.client_id,
            credentials.client_secret,
            credentials.redirect_uris[0]
        );
    }

    getAuthUrl() {
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/gmail.readonly',
                'https://www.googleapis.com/auth/gmail.send',
                'https://www.googleapis.com/auth/gmail.modify'
            ],
            prompt: 'consent'
        });
    }

    async saveTokens(code: string) {
        const { tokens } = await this.oauth2Client.getToken(code);
        this.oauth2Client.setCredentials(tokens);

        const authRepo = AppDataSource.getRepository(GmailAuth);
        let auth = await authRepo.findOneBy({ userId: 'default' });
        if (!auth) {
            auth = authRepo.create({ userId: 'default' });
        }
        auth.accessToken = tokens.access_token || undefined;
        auth.refreshToken = tokens.refresh_token || undefined;
        auth.expiryDate = tokens.expiry_date || undefined;
        await authRepo.save(auth);

        return tokens;
    }

    async loadSavedCredentials() {
        const authRepo = AppDataSource.getRepository(GmailAuth);
        const auth = await authRepo.findOneBy({ userId: 'default' });
        if (auth && auth.accessToken) {
            this.oauth2Client.setCredentials({
                access_token: auth.accessToken,
                refresh_token: auth.refreshToken,
                expiry_date: Number(auth.expiryDate)
            });
            return true;
        }
        return false;
    }

    async logout() {
        const authRepo = AppDataSource.getRepository(GmailAuth);
        const auth = await authRepo.findOneBy({ userId: 'default' });
        if (auth) {
            auth.accessToken = undefined;
            auth.refreshToken = undefined;
            auth.expiryDate = undefined;
            await authRepo.save(auth);

            // Also reset local client credentials
            this.oauth2Client.setCredentials({});
        }
    }

    async syncThreads() {
        const isLoaded = await this.loadSavedCredentials();
        if (!isLoaded) throw new Error('Not authenticated');

        const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
        const res = await gmail.users.threads.list({ userId: 'me', maxResults: 10 });
        const threads = res.data.threads || [];

        const threadRepo = AppDataSource.getRepository(GmailThread);
        const leadRepo = AppDataSource.getRepository(Lead);

        for (const t of threads) {
            const existingThread = await threadRepo.findOneBy({ threadId: t.id! });
            if (!existingThread) {
                const threadDetails = await gmail.users.threads.get({ userId: 'me', id: t.id! });
                const mainMessage = threadDetails.data.messages?.[0];
                const snippet = mainMessage?.snippet;
                const headers = mainMessage?.payload?.headers;
                const subject = headers?.find(h => h.name === 'Subject')?.value;
                const from = headers?.find(h => h.name === 'From')?.value;

                // Simple Lead extraction from 'From' header
                let leadName = from || 'Unknown';
                let leadEmail = '';
                const emailMatch = from?.match(/<(.+)>/);
                if (emailMatch) {
                    leadEmail = emailMatch[1];
                    leadName = from!.split('<')[0].trim();
                } else if (from?.includes('@')) {
                    leadEmail = from;
                }

                // Check if lead already exists by email
                let lead: Lead | null = null;
                if (leadEmail) {
                    const leads = await leadRepo.find();
                    lead = leads.find(l => l.emails?.includes(leadEmail)) || null;
                }

                if (!lead) {
                    lead = leadRepo.create({
                        name: leadName,
                        emails: leadEmail ? [leadEmail] : [],
                        priority: 'Medium',
                    });
                    await leadRepo.save(lead);
                }

                const newThread = threadRepo.create({
                    threadId: t.id!,
                    subject: subject || undefined,
                    snippet: snippet || undefined,
                    leadId: lead.id,
                    lastMessageDate: mainMessage?.internalDate ? new Date(Number(mainMessage.internalDate)) : undefined
                });
                await threadRepo.save(newThread);
            }
        }
    }

    private getMessageBody(payload: any): string {
        let body = '';
        if (payload.parts) {
            for (const part of payload.parts) {
                if (part.mimeType === 'text/plain') {
                    body += Buffer.from(part.body.data, 'base64').toString('utf8');
                } else if (part.mimeType === 'text/html') {
                    // We could also return HTML, but for now let's prioritize plain text or just take html if no text
                    if (!body) body = Buffer.from(part.body.data, 'base64').toString('utf8');
                } else if (part.parts) {
                    body += this.getMessageBody(part);
                }
            }
        } else if (payload.body && payload.body.data) {
            body = Buffer.from(payload.body.data, 'base64').toString('utf8');
        }
        return body || payload.snippet || '';
    }

    async getThreadMessages(threadId: string) {
        const isLoaded = await this.loadSavedCredentials();
        if (!isLoaded) throw new Error('Not authenticated');

        const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
        const res = await gmail.users.threads.get({ userId: 'me', id: threadId });

        // Enrich messages with extracted bodies
        if (res.data.messages) {
            res.data.messages = res.data.messages.map(msg => ({
                ...msg,
                extractedBody: this.getMessageBody(msg.payload)
            }));
        }

        return res.data;
    }

    async sendReply(threadId: string, text: string) {
        const isLoaded = await this.loadSavedCredentials();
        if (!isLoaded) throw new Error('Not authenticated');

        const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
        console.log(`Sending reply to thread: ${threadId}`);
        const thread = await gmail.users.threads.get({ userId: 'me', id: threadId });
        console.log(`Thread fetched, message count: ${thread.data.messages?.length}`);

        const lastMessage = thread.data.messages?.[thread.data.messages.length - 1];
        if (!lastMessage) throw new Error('Thread has no messages');

        const headers = lastMessage.payload?.headers;
        const subject = headers?.find(h => h.name?.toLowerCase() === 'subject')?.value || 'No Subject';
        const from = headers?.find(h => h.name?.toLowerCase() === 'from')?.value;
        const messageId = headers?.find(h => h.name?.toLowerCase() === 'message-id')?.value;
        const references = headers?.find(h => h.name?.toLowerCase() === 'references')?.value || '';

        const to = from; // Replying to the sender

        const emailHeaders: string[] = [
            `To: ${to}`,
            `Subject: Re: ${subject}`,
            'Content-Type: text/plain; charset="UTF-8"',
        ];

        if (messageId) {
            emailHeaders.push(`In-Reply-To: ${messageId}`);
            emailHeaders.push(`References: ${references ? references + ' ' : ''}${messageId}`);
        }

        const email = [
            ...emailHeaders,
            '',
            text
        ].join('\r\n');

        const encodedEmail = Buffer.from(email)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedEmail,
                threadId: threadId
            }
        });

        // Update lead status to 'Waiting for Response'
        const threadRepo = AppDataSource.getRepository(GmailThread);
        const savedThread = await threadRepo.findOne({ where: { threadId }, relations: ['lead'] });
        if (savedThread && savedThread.lead) {
            const leadRepo = AppDataSource.getRepository(Lead);
            savedThread.lead.status = 'Waiting for Response';
            await leadRepo.save(savedThread.lead);
        }
    }
}
