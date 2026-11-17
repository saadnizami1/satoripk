// Pakistan crisis lines. This is the single source for the Help page, the
// landing page and Kokoro's emergency strip; Kokoro's system prompt in
// app/api/chat/route.ts repeats 1122 and Umang, so keep them in sync.
// Do not change a number without verifying it.

export interface Helpline {
  name: string
  number: string
  note: string
  href: string
  crisis?: boolean
}

export const HELPLINES: Helpline[] = [
  { name: 'Rescue',             number: '1122',         note: 'Emergency services and ambulance, 24/7', href: 'tel:1122', crisis: true },
  { name: 'Umang helpline',     number: '0317-4288665', note: 'Free mental health counselling',          href: 'tel:03174288665' },
  { name: 'Umang on WhatsApp',  number: '0311-7786264', note: 'Message a counsellor on WhatsApp',        href: 'https://wa.me/923117786264' },
  { name: 'Rozan counselling',  number: '051-2890505',  note: 'Counselling helpline, Islamabad',         href: 'tel:0512890505' },
  { name: 'Edhi Foundation',    number: '115',          note: 'Welfare and crisis support',              href: 'tel:115' },
]
