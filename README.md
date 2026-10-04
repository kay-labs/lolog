# lolog

배운 것을 계층형 카테고리로 정리하는 개인 TIL 블로그입니다.
누구나 로그인 없이 글을 읽을 수 있고, 글 작성과 관리는 관리자만 할 수 있습니다.

## 기술 스택

| 구분 | 기술 |
|---|---|
| Backend | Java 17, Spring Boot 3.2, Spring Data JPA, Spring Security, JWT |
| Frontend | React 18, Vite, Tailwind CSS, Zustand, Toast UI Editor |
| Database | MariaDB |
| Infra | Nginx (HTTPS, Let's Encrypt) |

## 주요 기능

- **계층형 카테고리**: 카테고리를 단계 제한 없이 나눌 수 있고, 상위 카테고리를 고르면 하위 카테고리의 글까지 함께 보입니다.
- **카드 캐러셀 메인**: 글 목록을 카드 형태로 넘겨 보고, 카드를 클릭하면 글을 엽니다.
- **드롭다운 목록**: 상단 메뉴에서 카테고리와 글 목록을 펼쳐 볼 수 있습니다.
- **관리자 기능**: JWT로 로그인하고 글과 카테고리를 작성, 수정, 삭제합니다. 끌어다 놓기로 순서도 바꿀 수 있습니다.
- **공개 여부 설정**: 비공개 글은 관리자에게만 보입니다.
- **방문 로그**: 로그인하지 않은 방문자가 본 페이지와 IP를 기록합니다.

## 프로젝트 구조

```
lolog
├── backend    # Spring Boot API 서버
│   └── src/main/java/com/lolog
│       ├── config / security   # 보안 설정, JWT 인증
│       ├── controller / service / repository
│       └── domain / dto
└── frontend   # React 클라이언트
    └── src
        ├── pages / components
        ├── store               # Zustand 상태 관리
        └── api                 # axios 설정
```

## 로컬 실행

**1. 백엔드**

`backend/src/main/resources/application-local.yml`을 만들고 값을 채웁니다.

```yaml
spring:
  datasource:
    password: <DB 비밀번호>
jwt:
  secret: <32자 이상의 랜덤 문자열>
admin:
  initial-password: <관리자 초기 비밀번호>
```

```bash
cd backend
./gradlew bootRun --args='--spring.profiles.active=local'
```

**2. 프론트엔드**

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
