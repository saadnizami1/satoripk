import { redirect } from 'next/navigation'

// The about page is now public at /about; keep this old route working.
export default function CreatorPage() {
  redirect('/about')
}
