'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, fetchWithAuth } from '@/lib/client-auth'

export default function AICLIPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'usage' | 'demo'>('overview')
  const [cliOutput, setCliOutput] = useState<string[]>([])
  const [currentCommand, setCurrentCommand] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/admin/login')
      return
    }
  }, [router])

  const handleCommand = async (command: string) => {
    if (!command.trim()) return

    setIsProcessing(true)
    setCurrentCommand('')

    // 명령어를 출력에 추가
    setCliOutput(prev => [...prev, `$ ${command}`])

    try {
      // AI CLI API 호출 (인증 포함)
      const response = await fetchWithAuth('/api/ai-cli/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      })

      const data = await response.json()

      if (data.success) {
        // API 응답을 라인별로 처리
        const lines = data.output.split('\n')
        setCliOutput(prev => [...prev, ...lines])
      } else {
        setCliOutput(prev => [...prev, `❌ 오류: ${data.error}`])
      }
    } catch (error) {
      console.error('Command execution error:', error)
      setCliOutput(prev => [...prev, `❌ 오류: ${error.message}`])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(currentCommand)
    }
  }

  const clearTerminal = () => {
    setCliOutput([])
    setCurrentCommand('')
  }

  const runDemo = () => {
    const demoCommands = [
      'ai-cli --help',
      'ai-cli commit --demo',
      'ai-cli explain --demo --detailed',
      'ai-cli config --verbose'
    ]

    let index = 0
    const interval = setInterval(() => {
      if (index < demoCommands.length) {
        handleCommand(demoCommands[index])
        index++
      } else {
        clearInterval(interval)
      }
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            ⚡ AI CLI - AI-powered Git Assistant
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            전문적인 커밋 메시지 생성과 코드 변경 설명을 AI로 자동화하세요
          </p>

          <div className="flex justify-center gap-4">
            <button
              onClick={runDemo}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              🎮 라이브 데모
            </button>
            <button
              onClick={clearTerminal}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              🗑️ 터미널 클리어
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 rounded-lg p-1 mb-8">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${
                activeTab === 'overview'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              📋 개요
            </button>
            <button
              onClick={() => setActiveTab('usage')}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${
                activeTab === 'usage'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              🚀 사용법
            </button>
            <button
              onClick={() => setActiveTab('demo')}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${
                activeTab === 'demo'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              🎮 데모
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Terminal */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-lg p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-green-400 mb-2">💻 AI CLI Terminal</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>Connected to AI Backend</span>
                </div>
              </div>

              <div className="bg-gray-900 rounded p-4 font-mono text-sm text-gray-300 max-h-96 overflow-y-auto">
                {cliOutput.length === 0 ? (
                  <div className="text-gray-500">
                    <p>Welcome to AI CLI!</p>
                    <p>Type 'ai-cli --help' to see available commands</p>
                    <p>or click the demo button above to see it in action.</p>
                  </div>
                ) : (
                  cliOutput.map((line, index) => (
                    <div key={index} className={line.startsWith('❌') ? 'text-red-400' : line.startsWith('✅') ? 'text-green-400' : 'text-gray-300'}>
                      {line}
                    </div>
                  ))
                )}
                <div className="flex items-center">
                  <span className="text-green-400 mr-2">$</span>
                  <input
                    type="text"
                    value={currentCommand}
                    onChange={(e) => setCurrentCommand(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isProcessing}
                    placeholder="Enter AI CLI command..."
                    className="flex-1 bg-transparent border-none outline-none text-gray-300 placeholder-gray-500"
                  />
                  {isProcessing && <span className="ml-2 text-yellow-400 animate-pulse">⏳</span>}
                </div>
              </div>

              {/* Quick Commands */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  onClick={() => handleCommand('ai-cli --help')}
                  className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 px-3 rounded transition-colors"
                >
                  도움말
                </button>
                <button
                  onClick={() => handleCommand('ai-cli commit')}
                  className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 px-3 rounded transition-colors"
                >
                  커밋 생성
                </button>
                <button
                  onClick={() => handleCommand('ai-cli explain')}
                  className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 px-3 rounded transition-colors"
                >
                  변경 설명
                </button>
                <button
                  onClick={() => handleCommand('ai-cli config')}
                  className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 px-3 rounded transition-colors"
                >
                  설정 보기
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Start Card */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4 text-green-400">🚀 빠른 시작</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-gray-900 rounded p-3">
                  <p className="text-gray-300 font-mono">1. git add .</p>
                </div>
                <div className="bg-gray-900 rounded p-3">
                  <p className="text-gray-300 font-mono">2. ai-cli commit</p>
                </div>
                <div className="bg-gray-900 rounded p-3">
                  <p className="text-gray-300 font-mono">3. ✅ 완료!</p>
                </div>
              </div>
            </div>

            {/* Features Card */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4 text-green-400">✨ 주요 기능</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start">
                  <span className="mr-2">🤖</span>
                  <span>AI 커밋 메시지 생성</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">📝</span>
                  <span>코드 변경 설명</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🔒</span>
                  <span>다중 AI 백엔드 지원</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🛡️</span>
                  <span>엔터프라이즈급 보안</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🌐</span>
                  <span>컨텍스트 인식</span>
                </li>
              </ul>
            </div>

            {/* Status Card */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4 text-green-400">📊 상태 정보</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">AI 모델</span>
                  <span className="text-green-400">활성</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Git 리포지토리</span>
                  <span className="text-blue-400">준비됨</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">API 연결</span>
                  <span className="text-yellow-400">데모 모드</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content Details */}
        {activeTab === 'overview' && (
          <div className="bg-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-green-400">📋 개요</h2>
            <div className="prose prose prose-invert max-w-none text-gray-300">
              <p>
                AI CLI는 개발자의 Git 워크플로우를 혁신하는 지능형 커맨드 라인 도구입니다.
                AI가 코드 변경을 분석하여 전문적인 커밋 메시지를 생성하고,
                복잡한 코드 변경을 이해하기 쉽게 설명해줍니다.
              </p>
              <h3>🎯 핵심 가치</h3>
              <ul>
                <li><strong>시간 절약:</strong> 커밋 메시지 작성 시간을 90% 단축</li>
                <li><strong>품질 향상:</strong> Conventional Commits 표준 준수</li>
                <li><strong>일관성 유지:</strong> 프로젝트별 컨텍스트 인식</li>
                <li><strong>안전성 보장:</strong> 다층 보안 모델 적용</li>
              </ul>
              <h3>🏗️ 아키텍처</h3>
              <ul>
                <li><strong>Rust 기반:</strong> 고성능, 안전한 네이티브 바이너리</li>
                <li><strong>다중 AI 백엔드:</strong> Ollama, OpenAI, Anthropic 지원</li>
                <li><strong>컨텍스트 엔진:</strong> 프로젝트별 설정 자동 인식</li>
                <li><strong>MCP 지원:</strong> 확장성 있는 플랫폼 기반</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'usage' && (
          <div className="bg-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-green-400">🚀 사용법</h2>
            <div className="space-y-8">
              {/* Installation */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-blue-400">설치</h3>
                <div className="bg-gray-900 rounded-lg p-6">
                  <h4 className="font-mono text-green-400 mb-2"># Cargo를 통해 설치 (권장)</h4>
                  <pre className="text-gray-300">
                    <code>cargo install ai-cli</code>
                  </pre>

                  <h4 className="font-mono text-green-400 mt-4 mb-2"># 소스에서 빌드</h4>
                  <pre className="text-gray-300">
                    <code>git clone https://github.com/mon664/ai-cli.git
cd ai-cli
cargo build --release</code>
                  </pre>
                </div>
              </div>

              {/* Basic Usage */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-blue-400">기본 사용법</h3>
                <div className="space-y-4">
                  <div className="bg-gray-900 rounded-lg p-6">
                    <h4 className="font-mono text-green-400 mb-2"># 커밋 메시지 생성</h4>
                    <pre className="text-gray-300">
                      <code>git add .
ai-cli commit</code>
                    </pre>
                    <p className="text-sm text-gray-400 mt-2">
                      스테이징된 변경 사항을 분석하여 커밋 메시지 생성
                    </p>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-6">
                    <h4 className="font-mono text-green-400 mb-2"># 변경 사항 설명</h4>
                    <pre className="text-gray-300">
                      <code>ai-cli explain --detailed</code>
                    </pre>
                    <p className="text-sm text-gray-400 mt-2">
                      복잡한 코드 변경을 자연스러운 언어로 설명
                    </p>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-6">
                    <h4 className="font-mono text-green-400 mb-2"># 특정 커밋 분석</h4>
                    <pre className="text-gray-300">
                      <code>ai-cli explain --hash abc1234</code>
                    </pre>
                    <p className="text-sm text-gray-400 mt-2">
                      특정 커밋의 변경 사항만 분석
                    </p>
                  </div>
                </div>
              </div>

              {/* Advanced Features */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-blue-400">고급 기능</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <h4 className="font-mono text-green-400 mb-2">컨텍스트 모드</h4>
                    <p className="text-sm text-gray-300">
                      프로젝트별로 컨텍스트를 설정하여 더 정확한 결과물 얻기
                    </p>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4">
                    <h4 className="font-mono text-green-400 mb-2">다양한 포맷</h4>
                    <p className="text-sm text-gray-300">
                      JSON, Markdown 등 다양한 출력 포맷 지원
                    </p>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4">
                    <h4 className="font-mono text-green-400 mb-2">세션 승인인</h4>
                    <p className="text-sm text-gray-300">
                      세션별 명령어 실행 승인으로 빠른 반복 작업
                    </p>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4">
                    <h4 className="font-mono text-green-400 mb-2">MCP 연동</h4>
                    <p className="text거-300 text-sm">
                      Model Context Protocol로 확장성 증대
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="bg-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-green-400">🎮 인터랙티브 데모</h2>

            <div className="bg-gray-900 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-blue-400">데모 시나리오</h3>
              <ol className="space-y-4 text-sm text-gray-300">
                <li>AI가 웹사이트 방문자들을 분석하여 블로그 주제 생성</li>
                <li>생성된 주제로 고품질 콘텐츠 작성 (2000-3000자)</li>
                <li>관련 이미지 자동 생성 (웹사이트, 메뉴 등)</li>
                <li>SEO 최적화된 메타데이터 자동 생성</li>
                <li>블로그에 자동 게시 및 Redis 저장</li>
              </ol>
            </div>

            <div className="text-center">
              <button
                onClick={runDemo}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all transform hover:scale-105"
              >
                🎬 지금 데모 실행하기
              </button>
              <p className="text-gray-400 mt-4 text-sm">
                데모는 실제 AI API를 사용하여 약 2분 소요됩니다
              </p>
            </div>

            {/* Demo Features */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-gray-900 rounded-lg p-6">
                <h4 className="font-semibold text-blue-400 mb-3">🎨 데모 기능</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>실시간 터미널 시뮬레이션</li>
                  <li>AI 응답 스트리밍 표시</li>
                  <li>명령어 히스토리 관리</li>
                  <li>자동 완성 감지</li>
                </ul>
              </div>

              <div className="bg-gray-900 rounded-lg p-6">
                <h4 className="font-semibold text-blue-400 mb-3">📊 데모 결과</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>생성된 블로그 글 URL 제공</li>
                  <li>사용된 AI 모델 정보</li>
                  <li>소요 시간 및 비용 정보</li>
                  <li>생성된 이미지 미리보기</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}