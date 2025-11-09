// Next.js API route for generate-shorts
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { keywords, script, sceneCount = 5 } = req.body;

    // 모의 응답 생성
    const mockResponse = {
      success: true,
      data: {
        script: script || `${keywords}에 관한 쇼츠 스크립트입니다. 짧고 흥미로운 내용으로 구성되어 있습니다.`,
        scenes: Array.from({ length: sceneCount }, (_, i) => ({
          scene: i + 1,
          description: `장면 ${i + 1}: ${keywords} 관련 내용`,
          image_url: `https://picsum.photos/seed/scene${i + 1}/400/300.jpg`,
          audio_url: `https://example.com/audio/scene${i + 1}.mp3`,
          duration: 3
        })),
        total_duration: sceneCount * 3,
        background_music: "https://example.com/music/background.mp3"
      }
    };

    console.log('✅ 쇼츠 생성 성공:', keywords);
    res.status(200).json(mockResponse);

  } catch (error) {
    console.error('❌ 쇼츠 생성 중 오류:', error);
    res.status(500).json({
      success: false,
      error: '쇼츠 생성 중 오류가 발생했습니다.',
      details: error.message
    });
  }
}