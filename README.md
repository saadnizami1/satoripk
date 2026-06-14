# Satori — Mental Wellness for Students

Satori started as a research project looking into how academic stress affects students in Pakistan. The more I dug into it, the more obvious it became that just collecting data wasn't enough — students needed something they could actually use day to day, not just fill out a form and move on.

So it became an app.

---

## What it does

At its core, Satori is a personal space where students can check in with themselves. Not in a clinical, checkbox-y way — more like a quiet corner of the internet that remembers how you've been feeling and gently helps you take care of yourself.

**Kokoro** is the AI companion built into the app. You can talk to it about anything — exam stress, family stuff, feeling low for no reason, whatever. It's trained to be culturally aware and won't dish out generic Western therapy-speak. For anything serious, it always points toward real help.

**Mood tracking** is dead simple — pick an emoji, add a note if you want, done. Over time the graph shows you patterns you wouldn't have noticed otherwise. Exam season always hits hard in October? Now you can see it.

**The journal** is just a clean writing space. No prompts, no word counts, no pressure.

**Breathing exercises** and a **Pomodoro timer** are there for when you need to actually sit down and focus, or when you need to step away and breathe for a minute.

**Academic stress tracker** is where the research side lives. It asks a few questions each day about how things went academically and how you're holding up. That data (anonymised) feeds into the wider research on student wellbeing in Pakistan.

**Helplines** has the actual phone numbers — Umang, Rozan, Edhi, emergency services. Because sometimes an app isn't what you need.

---

## Who it's for

Students in Pakistan, mostly. The whole thing is designed with that context in mind — the academic pressure, the family expectations, the lack of open conversation around mental health, the fact that most mental health resources online assume you're in the US or UK.

That said, anyone can use it.

---

## Running it locally

You'll need a Supabase project and a Groq API key.

```bash
npm install
```

Create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

Then:

```bash
npm run dev
```

---

## Built by

Saad Nizami — as part of a research project on academic stress and mental health among students in Pakistan.
