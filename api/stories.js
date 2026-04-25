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

  const { action, token, story } = req.body

  // Verify user token
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Non autorisé' })

  try {
    // Save story
    if (action === 'save') {
      const { data, error } = await supabase.from('stories').insert({
        user_id: user.id,
        titre: story.titre,
        univers: story.univers,
        prenom: story.prenom,
        langue: story.langue,
        longueur: story.longueur,
        data: story,
        created_at: new Date().toISOString()
      }).select().single()
      if (error) return res.status(400).json({ error: error.message })
      return res.status(200).json({ story: data })
    }

    // Get user stories
    if (action === 'list') {
      const { data, error } = await supabase
        .from('stories')
        .select('id, titre, univers, prenom, langue, longueur, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) return res.status(400).json({ error: error.message })
      return res.status(200).json({ stories: data })
    }

    // Get one story
    if (action === 'get') {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('id', story.id)
        .eq('user_id', user.id)
        .single()
      if (error) return res.status(404).json({ error: 'Introuvable' })
      return res.status(200).json({ story: data })
    }

    // Delete story
    if (action === 'delete') {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', story.id)
        .eq('user_id', user.id)
      if (error) return res.status(400).json({ error: error.message })
      return res.status(200).json({ ok: true })
    }

    return res.status(400).json({ error: 'Unknown action' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
