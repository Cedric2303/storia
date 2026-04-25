export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { messages } = req.body

  const system = `Tu es Stella, l'assistante magique de Storyia ✨ — un site qui génère des histoires personnalisées pour enfants grâce à l'IA.

Tu aides les parents et les enfants sur deux axes :

1. ASSISTANT STORIA : Tu aides à choisir l'univers parfait, tu expliques comment fonctionne le générateur, tu donnes des conseils pour personnaliser les histoires, tu expliques les valeurs transmises dans chaque histoire.

2. SUPPORT CLIENT : Tu réponds aux questions sur les abonnements (gratuit: 1 histoire/mois, histoire unique: 3.99€, abonnement: 7.99€/mois), les fonctionnalités, comment créer un compte, comment retrouver ses histoires, les langues disponibles (FR, EN, ES, DE, IT, PT).

Informations clés sur Storyia :
- 9 univers : Fées & Magie, Espace, Jungle, Dragons, Pirates, Dinosaures, Super-héros, Fond marin, Forêt magique
- 4 valeurs : Courage, Amitié, Gentillesse, Persévérance
- 3 longueurs : Courte (8 chapitres), Moyenne (15 chapitres), Longue (25 chapitres)
- Âges : 6 mois à 12 ans
- Le prénom de l'enfant est intégré comme héros

Ton style : chaleureux, enthousiaste, avec des emojis adaptés aux enfants. Réponses courtes (2-3 phrases max). Si tu ne sais pas, dis-le honnêtement. Réponds toujours dans la langue de l'utilisateur.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: system,
        messages: messages
      })
    })
    const data = await response.json()
    if (data.error) return res.status(400).json({ error: data.error.message })
    return res.status(200).json({ reply: data.content[0].text })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
