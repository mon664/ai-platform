# AI CLI - AI-powered Git Assistant

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Rust](https://img.shields.io/badge/rust-1.91+-orange.svg)](https://www.rust-lang.org)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)]()

AI CLI는 개발자의 Git 워크플로우를 혁신하는 지능형 커맨드 라인 도구입니다. 전문적인 커밋 메시지를 자동 생성하고 코드 변경 사항을 설명해줍니다.

## ✨ 주요 기능

- 🤖 **AI 기반 커밋 메시지 생성**: Conventional Commit 표준에 맞는 전문적인 메시지 생성
- 📝 **코드 변경 사항 설명**: 복잡한 코드 변경을 이해하기 쉬운 자연어로 설명
- ⚡ **고성능**: Rust로 구현된 빠른 네이티브 바이너리
- 🚀 **경량화**: 최소한의 의존성으로 빠른 설치와 실행

## 🚀 빠른 시작

### 설치

**Cargo를 통해 설치 (권장):**
```bash
cargo install ai-cli
```

**직접 빌드:**
```bash
git clone https://github.com/mon664/ai-cli.git
cd ai-cli
cargo build --release
```

### 기본 사용법

```bash
# Git 리포지토리에서
cd your-project

# 커밋 메시지 생성
ai-cli commit

# 특정 메시지 사용
ai-cli commit --message "feat: add user authentication"

# 변경 사항 설명
ai-cli explain

# 특정 커밋 분석
ai-cli explain --hash abc1234

# 설정 확인
ai-cli config --verbose
```

## 📋 사용 예시

### 커밋 메시지 생성
```bash
$ ai-cli commit
🤖 AI is generating your commit message...
✨ Generated message: feat: add new feature implementation
✅ Commit successful!
```

### 코드 변경 설명
```bash
$ ai-cli explain
🔍 AI is analyzing the changes...
📄 Analysis: This change adds new functionality to improve user experience.
```

## 🏗️ 아키텍처

AI CLI는 다음과 같은 핵심 구성 요소로 이루어져 있습니다:

```
ai-cli/
├── src/
│   ├── main.rs          # 엔트리 포인트
│   └── cli.rs           # CLI 인터페이스 정의
└── Cargo.toml           # 프로젝트 설정
```

## ⚙️ 설정

AI CLI는 설정 파일 없이 바로 사용할 수 있습니다. 추가 설정은 향후 버전에서 제공될 예정입니다.

## 🔧 개발

### 빌드 요구사항
- Rust 1.91 이상

### 로컬 개발 환경 설정

```bash
# 리포지토리 클론
git clone https://github.com/mon664/ai-cli.git
cd ai-cli

# 빌드
cargo build --release

# 테스트
cargo test

# 실행
./target/release/ai-cli --help
```

## 🤝 기여하기

기여를 환영합니다! 다음 단계를 따라주세요:

1. 이 리포지토리를 포크하세요
2. 기능 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
3. 변경 사항을 커밋하세요 (`git commit -m 'feat: add amazing feature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성하세요

## 📄 라이선스

이 프로젝트는 Apache License 2.0 하에 라이선스가 부여됩니다. [LICENSE](LICENSE) 파일을 참조하세요.

## 🔗 관련 프로젝트

- [aicommits](https://github.com/NVIDIA/ai-commits) - 커밋 메시지 생성
- [git-ai](https://github.com/gpt-engineer-org/git-ai) - Git 작업 자동화
- [diff-explainer](https://github.com/pwwang/diff-explainer) - Diff 설명

## 🙏 감사

AI CLI는 다음 프로젝트에서 영감을 받았습니다:
- [clap](https://github.com/clap-rs/clap) - CLI 프레임워크
- [anyhow](https://github.com/dtolnay/anyhow) - 오류 처리

## 📞 지원

- 🐛 [버그 리포트](https://github.com/mon664/ai-cli/issues)
- 💡 [기능 요청](https://github.com/mon664/ai-cli/issues)
- 💬 [토론](https://github.com/mon664/ai-cli/discussions)

---

**AI CLI** - 개발자 워크플로우를 위한 스마트한 AI 파트너 🚀