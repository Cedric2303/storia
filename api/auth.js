import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { action, email, password, token } = req.body

  try {
    // Sign up
    if (action === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) return res.status(400).json({ error: error.message })
      return res.status(200).json({ user: data.user, session: data.session })
    }

    // Sign in with email/password
    if (action === 'signin') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return res.status(400).json({ error: error.message })
      return res.status(200).json({ user: data.user, session: data.session })
    }

    // Sign in with Google — return OAuth URL
    if (action === 'google') {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: process.env.SITE_URL + '/auth/callback' }
      })
      if (error) return res.status(400).json({ error: error.message })
      return res.status(200).json({ url: data.url })
    }

    // Get user from token
    if (action === 'me') {
      const { data, error } = await supabase.auth.getUser(token)
      if (error) return res.status(401).json({ error: 'Invalid token' })
      return res.status(200).json({ user: data.user })
    }

    // Sign out
    if (action === 'signout') {
      await supabase.auth.signOut()
      return res.status(200).json({ ok: true })
    }

    return res.status(400).json({ error: 'Unknown action' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
