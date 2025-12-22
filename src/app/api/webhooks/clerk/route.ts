import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    // Get the headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error occured -- no svix headers', {
            status: 400,
        });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your secret
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

    let evt: WebhookEvent;

    // Verify the payload with the headers
    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error('Error verifying webhook:', err);
        return new Response('Error occured', {
            status: 400,
        });
    }

    const eventType = evt.type;
    const supabase = createServiceRoleClient();

    // Handle user creation
    if (eventType === 'user.created') {
        const { id, email_addresses, first_name, last_name, public_metadata } = evt.data;

        const email = email_addresses?.[0]?.email_address;
        const fullName = [first_name, last_name].filter(Boolean).join(' ') || 'User';
        const role = (public_metadata?.role as string) || 'candidate';

        const { error } = await supabase
            .from('profiles')
            .upsert({
                id,
                email,
                full_name: fullName,
                role: role as 'admin' | 'interviewer' | 'candidate',
                interviewer_status: role === 'interviewer' ? 'offline' : 'offline',
            });

        if (error) {
            console.error('Error creating profile:', error);
            return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
        }
    }

    // Handle user update
    if (eventType === 'user.updated') {
        const { id, email_addresses, first_name, last_name, public_metadata } = evt.data;

        const email = email_addresses?.[0]?.email_address;
        const fullName = [first_name, last_name].filter(Boolean).join(' ');
        const role = public_metadata?.role as string;

        const updateData: Record<string, unknown> = {
            email,
            full_name: fullName,
        };

        if (role) {
            updateData.role = role;
        }

        const { error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', id);

        if (error) {
            console.error('Error updating profile:', error);
        }
    }

    // Handle user deletion
    if (eventType === 'user.deleted') {
        const { id } = evt.data;

        if (id) {
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting profile:', error);
            }
        }
    }

    return NextResponse.json({ received: true });
}
