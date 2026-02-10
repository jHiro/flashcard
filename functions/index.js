'use strict'

const admin = require('firebase-admin')
const functions = require('firebase-functions')
const textToSpeech = require('@google-cloud/text-to-speech')

admin.initializeApp()

const ttsClient = new textToSpeech.TextToSpeechClient()

const MAX_TEXT_LENGTH = 200
const DEFAULT_LANGUAGE_CODE = 'ja-JP'
const DEFAULT_VOICE_NAME = 'ja-JP-Neural2-B'

const getAllowedOrigins = () => {
  const raw = process.env.TTS_ALLOWED_ORIGINS || ''
  return raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
}

const setCorsHeaders = (res, origin) => {
  const allowedOrigins = getAllowedOrigins()
  let allowOrigin = '*'

  if (allowedOrigins.length > 0) {
    allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0]
  }

  res.set('Access-Control-Allow-Origin', allowOrigin)
  res.set('Vary', 'Origin')
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

const getBearerToken = (authHeader) => {
  if (!authHeader) return null
  const match = authHeader.match(/^Bearer (.+)$/)
  return match ? match[1] : null
}

exports.tts = functions
  .runWith({ serviceAccount: 'flashcard-95fa7@appspot.gserviceaccount.com' })
  .https.onRequest(async (req, res) => {
  const origin = req.get('origin') || ''
  setCorsHeaders(res, origin)

  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const token = getBearerToken(req.get('authorization'))
  if (!token) {
    res.status(401).json({ error: 'Missing auth token' })
    return
  }

  try {
    await admin.auth().verifyIdToken(token)
  } catch (error) {
    console.error('TTS auth error:', error)
    res.status(401).json({ error: 'Invalid auth token' })
    return
  }

  const { text, languageCode, voiceName } = req.body || {}

  if (typeof text !== 'string' || text.trim().length === 0) {
    res.status(400).json({ error: 'text is required' })
    return
  }

  const normalizedText = text.trim()
  if (normalizedText.length > MAX_TEXT_LENGTH) {
    res.status(413).json({ error: `text must be <= ${MAX_TEXT_LENGTH} characters` })
    return
  }

  const request = {
    input: { text: normalizedText },
    voice: {
      languageCode: languageCode || DEFAULT_LANGUAGE_CODE,
      name: voiceName || DEFAULT_VOICE_NAME,
      ssmlGender: 'FEMALE',
    },
    audioConfig: {
      audioEncoding: 'MP3',
    },
  }

  try {
    const [response] = await ttsClient.synthesizeSpeech(request)

    if (!response.audioContent) {
      res.status(500).json({ error: 'TTS generation failed' })
      return
    }

    res.set('Cache-Control', 'no-store')
    res.status(200).json({ audioContent: response.audioContent.toString('base64') })
  } catch (error) {
    console.error('TTS error:', error)
    res.status(500).json({ error: 'TTS generation failed' })
  }
  })
