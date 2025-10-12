당신은 Supabase + 웹 앱 환경에서 동작하는 시스템의 데이터베이스 설계와 기능을 이해해야 합니다.  
이 앱은 **상점(Admin)** 과 **고객(User)** 이 이용하는 두 가지 웹사이트로 구성됩니다.  
현재 기능은 단순히 메뉴판 제공과 대기 번호 관리이지만, 추후 즐겨찾기/예약/포인트 적립 등의 확장을 고려해야 합니다.  
아래의 앱 개념과 데이터베이스 스키마를 항상 참고해 답변하세요.

---

## 앱 개념
- 고객(User 사이트):
  - 로그인 불필요 (익명 접근 가능)
  - QR 코드로 특정 상점의 메뉴판을 확인
  - 실시간 대기 번호 현황 확인
  - 추후: 로그인 고객은 즐겨찾기, 예약, 포인트 적립 기능을 사용할 수 있음

- 상점(Admin 사이트):
  - 관리자 계정 로그인 필요
  - 매장 정보 관리 (이름, 설명, 로고, 대표 이미지, 연락처 등)
  - 메뉴 관리 (메뉴명, 가격, 설명, 이미지, 판매 여부)
  - 대기 번호 발급 및 관리
  - QR 코드 생성 (매장별 메뉴판 접근용)

- Supabase Auth:
  - 기본 유저 정보는 `auth.users` (UUID 기반 id) 테이블에 저장됨
  - 실제 서비스용 계정 정보는 `accounts` 테이블을 별도로 두고 `auth.users.id` 를 참조

---

## 데이터베이스 스키마

### accounts (계정)
- account_id BIGINT PK
- auth_user_id UUID FK -> auth.users.id (비회원 고객은 NULL)
- store_id BIGINT FK (관리자 계정만 연결, 고객은 NULL)
- role ENUM('ADMIN','CUSTOMER','SUPER_ADMIN')
- name VARCHAR(100)
- email VARCHAR(255)
- created_at TIMESTAMP
- updated_at TIMESTAMP

### stores (매장)
- store_id BIGINT PK
- name VARCHAR(100)
- description TEXT
- address VARCHAR(255)
- phone VARCHAR(50)
- logo_url VARCHAR(255)   -- 매장 로고
- cover_url VARCHAR(255)  -- 매장 대표 이미지
- created_at TIMESTAMP
- updated_at TIMESTAMP

### menus (메뉴판)
- menu_id BIGINT PK
- store_id BIGINT FK -> stores.store_id
- name VARCHAR(100)
- description TEXT
- price DECIMAL(10,2)
- image_url VARCHAR(255)  -- 메뉴 이미지
- is_active BOOLEAN
- created_at TIMESTAMP
- updated_at TIMESTAMP

### queues (대기 번호)
- queue_id BIGINT PK
- store_id BIGINT FK -> stores.store_id
- queue_number INT
- status ENUM('WAITING','CALLED','DONE','CANCELED')
- created_at TIMESTAMP
- called_at TIMESTAMP NULL

### qrcodes (QR 코드)
- qr_id BIGINT PK
- store_id BIGINT FK -> stores.store_id
- code VARCHAR(255) -- QR URL/토큰
- is_active BOOLEAN
- created_at TIMESTAMP

### 확장 테이블 (추후 필요 시)
- favorites (즐겨찾기)
- reservations (예약)
- points (포인트 적립)

---

## 핵심 원칙
1. 고객은 로그인 없이 메뉴와 대기 번호 조회 가능  
2. Supabase `auth.users` 는 인증용, `accounts` 는 서비스 로직용  
3. 상점은 반드시 관리자 계정(role=ADMIN)과 연결  
4. 확장 기능 (즐겨찾기, 예약, 포인트)은 `accounts(role=CUSTOMER)` 를 통해 관리  
5. 이미지(메뉴, 매장 로고, 매장 대표 사진)는 DB에는 URL만 저장 (파일은 Supabase Storage 등 외부 저장소 사용)