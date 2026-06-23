# 배포 가이드 (GitHub Pages, 무료·상시)

이 앱은 **백엔드가 없는 정적 사이트**입니다. 프론트엔드가 `players_data.json`(약 5MB, gzip 565KB)을
한 번 받아서 필터·검색·정렬을 모두 브라우저에서 처리합니다. 서버 비용이 없고 콜드 스타트도 없습니다.

> 공개(public) 저장소이므로 GitHub Pages로 바로 무료 호스팅됩니다. (별도 서비스 불필요)

## 구조

- `frontend/` — React + Vite 정적 앱. 빌드 시 `copy-data.mjs`가 루트의 `players_data.json`을
  `frontend/public/`으로 복사해 번들에 포함합니다.
- `players_data.json` — 단일 데이터 소스(저장소에 커밋됨).
- `sync_data.py` / `force_sync.py` — 네이버 API에서 데이터를 받아 `players_data.json`을 갱신
  (파이썬 표준 라이브러리만 사용 → 설치 불필요).
- `.github/workflows/deploy.yml` — main에 push되면 빌드 후 Pages로 배포.
- `.github/workflows/sync.yml` — 매일 1회(05:00 KST) 현재 시즌을 갱신·커밋 → 자동 재배포.

## 1단계: 공개 GitHub 저장소 만들고 푸시 (사용자)

로컬 커밋은 이미 준비돼 있습니다. 공개 저장소만 만들어 연결하면 됩니다.

1. https://github.com/new 접속 → 저장소 이름(예: `kbo-stats`) 입력 → **Public** 선택 →
   README/.gitignore 등은 **추가하지 말고** "Create repository".
2. 생성 후 원격을 연결하고 푸시합니다(아이디 부분만 본인 것으로):

   ```powershell
   cd C:\Users\LENOVO\module\KBO
   git remote add origin https://github.com/<아이디>/kbo-stats.git
   git push -u origin main
   ```

   푸시 시 GitHub 로그인 창이 뜨면 인증합니다(브라우저 또는 Git Credential Manager).

## 2단계: GitHub Pages 활성화 (사용자)

- 저장소 → **Settings → Pages → Build and deployment → Source** 를 **GitHub Actions** 로 설정.

설정 후 `Actions` 탭에서 **Deploy to GitHub Pages** 워크플로가 자동 실행됩니다.
완료되면 사이트 주소는 다음과 같습니다(어느 컴퓨터·휴대폰에서나 접속 가능):

```
https://<깃허브아이디>.github.io/kbo-stats/
```

## 3단계: 데이터 자동 갱신 (자동, 설정 불필요)

- **자동**: `sync.yml`이 매일 현재 시즌을 갱신하고 변경이 있으면 커밋 → 사이트 자동 재배포.
- **즉시 갱신**: GitHub 저장소 → **Actions → Daily data sync → Run workflow**.
- **과거 시즌까지 전체 복구**가 필요하면 로컬에서:
  ```powershell
  cd C:\Users\LENOVO\module\KBO
  python force_sync.py        # 2010~현재 전 시즌 재크롤
  git add players_data.json
  git commit -m "데이터 전체 갱신"
  git push
  ```

## 로컬 실행

```powershell
cd C:\Users\LENOVO\module\KBO\frontend
npm install
npm run dev        # predev 단계에서 데이터가 자동 복사됨
```

`backend.py`(Flask)는 사이트 구동에 더 이상 필요하지 않습니다. 데이터 작업용으로만 남겨둡니다.
