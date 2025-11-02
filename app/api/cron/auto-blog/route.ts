import { NextRequest, NextResponse } from 'next/server'
import { generateTopics } from '@/lib/auto-blog/topic-generator'
import { generateContent } from '@/lib/auto-blog/content-generator'
import { generateImages } from '@/lib/auto-blog/image-generator'
import { publishBlog } from '@/lib/auto-blog/blog-publisher'
import { logGeneration, logError } from '@/lib/auto-blog-storage'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token')
  const authHeader = req.headers.get('authorization')
  const vercelCronHeader = req.headers.get('x-vercel-cron')
  const okHeader = authHeader === `Bearer ${process.env.CRON_SECRET}`
  const okQuery = token && token === process.env.CRON_SECRET
  const okVercelCron = !!vercelCronHeader // Allow Vercel Cron jobs
  if (!okHeader && !okQuery && !okVercelCron) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const topics = await generateTopics(1)
    const topic = topics[0]
    const started = Date.now()
    const content = await generateContent(topic)
    const images = await generateImages(content, topic)
    const result = await publishBlog(content, images)
    const duration = Date.now() - started
    await logGeneration({ topic, result, duration, imagesGenerated: images.length, success: result.success, timestamp: new Date().toISOString() })
    return NextResponse.json({ success: true, result })
  } catch (error: any) {
    await logError(error)
    return NextResponse.json({ error: error?.message ?? 'failed' }, { status: 500 })
  }
}
