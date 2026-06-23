# 배포 가이드 (비공개 저장소 + Cloudflare Pages, 무료·상시)

이 앱은 **백엔드가 없는 정적 사이트**입니다. 프론트엔드가 `players_data.json`(약 5MB, gzip 565KB)을
한 번 받아서 필터·검색·정렬을 모두 브라우저에서 처리합니다. 서버 비용이 없고 콜드 스타트도 없습니다.

> ⚠️ **GitHub Pages는 무료 플랜에서 공개 저장소만** 호스팅합니다. 저장소를 **비공개**로 유지하려면
> 호스팅은 **Cloudflare Pages**(또는 Vercel/Netlify)를 사용합니다. 이들은 비공개 GitHub 저장소를
> 무료로 배포해 주며, 소스는 비공개로 유지되고 배포된 사이트 주소만 공개됩니다.

## 구조

- `frontend/` — React + Vite 정적 앱. 빌드 시 `copy-data.mjs`가 루트의 `players_data.json`을
  `frontend/public/`으로 복사해 번들에 포함합니다.
- `players_data.json` — 단일 데이터 소스(저장소에 커밋됨).
- `sync_data.py` / `force_sync.py` — 네이버 API에서 데이터를 받아 `players_data.json`을 갱신
  (파이썬 표준 라이브러리만 사용 → 설치 불필요).
- `.github/workflows/sync.yml` — 매일 1회(05:00 KST) 현재 시즌을 갱신·커밋. 그 커밋이
  Cloudflare Pages의 자동 재배포를 트리거합니다.

## 1단계: 비공개 GitHub 저장소 만들고 푸시 (사용자)

로컬 커밋은 이미 준비돼 있습니다(아래 "준비 완료 상태" 참고). 비공개 저장소만 만들어 연결하면 됩니다.

1. https://github.com/new 접속 → 저장소 이름(예: `kbo-stats`) 입력 → **Private** 선택 →
   README/.gitignore 등은 **추가하지 말고** "Create repository".
2. 생성 후 안내되는 주소로 원격을 연결하고 푸시합니다(아이디 부분만 본인 것으로):

   ```powershell
   cd C:\Users\LENOVO\module\KBO
   git remote add origin https://github.com/<아이디>/kbo-stats.git
   git push -u origin main
   ```

   푸시 시 GitHub 로그인 창이 뜨면 인증합니다(브라우저 또는 Git Credential Manager).

## 2단계: Cloudflare Pages 연결 (사용자)

1. https://dash.cloudflare.com → **Workers & Pages → Create → Pages → Connect to Git**.
2. GitHub 계정을 연결(OAuth)하고 방금 만든 **비공개 저장소**를 선택.
3. 빌드 설정을 다음과 같이 지정:
   - **Framework preset**: `Vite` (없으면 None)
   - **Root directory**: `frontend`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. **Save and Deploy**. 1~2분 후 `https://kbo-stats.pages.dev` 같은 공개 주소가 발급됩니다.
   이 주소는 **어느 컴퓨터·휴대폰에서나** 접속됩니다.

> Vercel을 선호하면: New Project → 저장소 선택 → **Root Directory = `frontend`** 만 지정하면
> 나머지(빌드 `npm run build`, 출력 `dist`)는 자동 감지됩니다.

## 3단계: 데이터 자동 갱신 (자동, 설정 불필요)

`sync.yml`이 매일 현재 시즌을 갱신하고 변경 시 커밋합니다. Cloudflare Pages는 그 push를 감지해
사이트를 자동 재배포합니다. (비공개 저장소도 GitHub Actions 무료 한도 내에서 동작)

- **즉시 갱신**이 필요하면: GitHub 저장소 → **Actions → Daily data sync → Run workflow**.
- **과거 시즌까지 전체 복구**가 필요하면 로컬에서:
  ```powershell
  cd C:\Users\LENOVO\module\KBO
  python force_sync.py
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
