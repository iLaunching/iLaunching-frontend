import json
import os

# Phase 2: Asian Languages (ja-JP, zh-CN, zh-TW, ko-KR, th-TH, vi-VN, id-ID)
phase2_translations = {
    'ja-JP': {  # Japanese
        "welcome": {
            "variations": [
                "こんにちは！ 👋 iLaunchingへようこそ。始めましょうか？",
                "こんにちは！素晴らしいことを始める準備はできていますか？",
                "ようこそ！あなたの旅を始めましょう。",
                "こんにちは！正しい場所に来ました。始めましょう！"
            ]
        },
        "welcomeBack": {
            "variations": [
                "おかえりなさい！ 😊",
                "おや、覚えています！おかえりなさい！",
                "またお会いできて嬉しいです！",
                "お帰りなさい！"
            ]
        },
        "acknowledge": {
            "variations": [
                "ありがとうございます！少々お待ちください...",
                "完璧です、確認中...",
                "少々お待ちください、確認しています...",
                "受信しました！クイックチェック..."
            ]
        },
        "checking": {
            "variations": [
                "<strong>{email}</strong>を検索中...",
                "<strong>{email}</strong>を確認中...",
                "システム内で<strong>{email}</strong>をチェック中...",
                "少々お待ちください、<strong>{email}</strong>を検索中..."
            ]
        },
        "wrongFormat": {
            "variations": [
                "うーん、これは有効なメールアドレスのようには見えません。もう一度試してみますか？",
                "おっと！無効なメール形式です。もう一度確認しますか？",
                "そのメールに何か問題があります。確認していただけますか？",
                "そのメール形式は奇妙に見えます。もう一度確認しますか？"
            ]
        },
        "userNotRegistered": {
            "variations": [
                "新しい方のようですね！ワクワクします。参加しますか？",
                "まだシステムに登録されていません。始める準備はできていますか？",
                "新しい顔ですね！アカウントを作成しますか？",
                "まだ登録されていませんね。変更しましょうか？"
            ]
        },
        "askName": {
            "variations": [
                "素晴らしい選択です！お名前は何ですか？",
                "完璧です！何とお呼びすればよろしいですか？",
                "素晴らしい！お名前を教えてください。",
                "いいですね！お名前は何ですか？"
            ]
        },
        "loginPrompt": {
            "variations": [
                "おかえりなさい！メールアドレスは何ですか？",
                "またお会いできて嬉しいです！メールアドレスを入力してください。",
                "ログインしましょう。メールアドレスは何ですか？",
                "ログインする準備はできていますか？メールアドレスを共有してください。"
            ]
        },
        "passwordPrompt": {
            "variations": [
                "見つけました！パスワードを入力してください。",
                "発見しました！パスワードは何ですか？",
                "そこにいましたね！続行するにはパスワードを入力してください。",
                "わかりました！パスワードをお願いします。"
            ]
        },
        "passwordCreate": {
            "message": "完璧です！アカウントを保護しましょう。パスワードを作成してください（8文字以上）："
        },
        "passwordTooShort": {
            "message": "パスワードは8文字以上である必要があります。もう一度試しますか？"
        },
        "nameRequired": {
            "message": "続行するにはお名前が必要です。お名前は何ですか？"
        },
        "errors": {
            "generic": "おっと！問題が発生しました。もう一度お試しください。",
            "emailCheck": "メールの確認に失敗しました",
            "loginFailed": "ログインに失敗しました。認証情報を確認してください。",
            "signupFailed": "登録に失敗しました。もう一度お試しください。"
        }
    },
    'zh-CN': {  # Chinese Simplified
        "welcome": {
            "variations": [
                "你好！ 👋 欢迎来到iLaunching。开始吧？",
                "嘿！准备好开始一些了不起的事情了吗？",
                "欢迎！让我们开始您的旅程。",
                "你好！您来对地方了。开始吧！"
            ]
        },
        "welcomeBack": {
            "variations": [
                "欢迎回来！ 😊",
                "嘿，我记得你！欢迎回来！",
                "很高兴再次见到你！",
                "你又来了！欢迎！"
            ]
        },
        "acknowledge": {
            "variations": [
                "谢谢！稍等...",
                "完美，正在检查...",
                "稍等，正在验证...",
                "收到！快速检查..."
            ]
        },
        "checking": {
            "variations": [
                "正在查找<strong>{email}</strong>...",
                "正在检查<strong>{email}</strong>...",
                "正在系统中检查<strong>{email}</strong>...",
                "稍等，正在查找<strong>{email}</strong>..."
            ]
        },
        "wrongFormat": {
            "variations": [
                "嗯，这看起来不像是有效的电子邮件。再试一次？",
                "哎呀！无效的电子邮件格式。再检查一次？",
                "该电子邮件有问题。您能检查一下吗？",
                "该电子邮件格式看起来很奇怪。再检查一次？"
            ]
        },
        "userNotRegistered": {
            "variations": [
                "看起来你是新来的！太令人兴奋了。想加入吗？",
                "我在系统中还没有看到您。准备开始了吗？",
                "新面孔！想创建一个账户吗？",
                "您还没有注册。我们改变一下？"
            ]
        },
        "askName": {
            "variations": [
                "很棒的选择！您叫什么名字？",
                "完美！我应该怎么称呼您？",
                "太好了！告诉我您的名字。",
                "好的！您叫什么名字？"
            ]
        },
        "loginPrompt": {
            "variations": [
                "欢迎回来！您的电子邮件是什么？",
                "很高兴再次见到您！输入您的电子邮件。",
                "让我们登录。您的电子邮件是什么？",
                "准备登录了吗？分享您的电子邮件。"
            ]
        },
        "passwordPrompt": {
            "variations": [
                "我看到你了！现在输入您的密码。",
                "找到了！您的密码是什么？",
                "你在那里！输入您的密码以继续。",
                "明白了！现在请输入您的密码。"
            ]
        },
        "passwordCreate": {
            "message": "完美！现在让我们保护您的账户。创建一个密码（至少8个字符）："
        },
        "passwordTooShort": {
            "message": "您的密码需要至少8个字符。再试一次？"
        },
        "nameRequired": {
            "message": "我需要您的名字才能继续。您叫什么名字？"
        },
        "errors": {
            "generic": "哎呀！出了点问题。请再试一次。",
            "emailCheck": "检查电子邮件失败",
            "loginFailed": "登录失败。检查您的凭据。",
            "signupFailed": "注册失败。请再试一次。"
        }
    },
    'zh-TW': {  # Chinese Traditional
        "welcome": {
            "variations": [
                "你好！ 👋 歡迎來到iLaunching。開始吧？",
                "嘿！準備好開始一些了不起的事情了嗎？",
                "歡迎！讓我們開始您的旅程。",
                "你好！您來對地方了。開始吧！"
            ]
        },
        "welcomeBack": {
            "variations": [
                "歡迎回來！ 😊",
                "嘿，我記得你！歡迎回來！",
                "很高興再次見到你！",
                "你又來了！歡迎！"
            ]
        },
        "acknowledge": {
            "variations": [
                "謝謝！稍等...",
                "完美，正在檢查...",
                "稍等，正在驗證...",
                "收到！快速檢查..."
            ]
        },
        "checking": {
            "variations": [
                "正在查找<strong>{email}</strong>...",
                "正在檢查<strong>{email}</strong>...",
                "正在系統中檢查<strong>{email}</strong>...",
                "稍等，正在查找<strong>{email}</strong>..."
            ]
        },
        "wrongFormat": {
            "variations": [
                "嗯，這看起來不像是有效的電子郵件。再試一次？",
                "哎呀！無效的電子郵件格式。再檢查一次？",
                "該電子郵件有問題。您能檢查一下嗎？",
                "該電子郵件格式看起來很奇怪。再檢查一次？"
            ]
        },
        "userNotRegistered": {
            "variations": [
                "看起來你是新來的！太令人興奮了。想加入嗎？",
                "我在系統中還沒有看到您。準備開始了嗎？",
                "新面孔！想創建一個帳戶嗎？",
                "您還沒有註冊。我們改變一下？"
            ]
        },
        "askName": {
            "variations": [
                "很棒的選擇！您叫什麼名字？",
                "完美！我應該怎麼稱呼您？",
                "太好了！告訴我您的名字。",
                "好的！您叫什麼名字？"
            ]
        },
        "loginPrompt": {
            "variations": [
                "歡迎回來！您的電子郵件是什麼？",
                "很高興再次見到您！輸入您的電子郵件。",
                "讓我們登錄。您的電子郵件是什麼？",
                "準備登錄了嗎？分享您的電子郵件。"
            ]
        },
        "passwordPrompt": {
            "variations": [
                "我看到你了！現在輸入您的密碼。",
                "找到了！您的密碼是什麼？",
                "你在那裡！輸入您的密碼以繼續。",
                "明白了！現在請輸入您的密碼。"
            ]
        },
        "passwordCreate": {
            "message": "完美！現在讓我們保護您的帳戶。創建一個密碼（至少8個字符）："
        },
        "passwordTooShort": {
            "message": "您的密碼需要至少8個字符。再試一次？"
        },
        "nameRequired": {
            "message": "我需要您的名字才能繼續。您叫什麼名字？"
        },
        "errors": {
            "generic": "哎呀！出了點問題。請再試一次。",
            "emailCheck": "檢查電子郵件失敗",
            "loginFailed": "登錄失敗。檢查您的憑據。",
            "signupFailed": "註冊失敗。請再試一次。"
        }
    },
    'ko-KR': {  # Korean
        "welcome": {
            "variations": [
                "안녕하세요! 👋 iLaunching에 오신 것을 환영합니다. 시작할까요?",
                "안녕하세요! 멋진 일을 시작할 준비가 되셨나요?",
                "환영합니다! 여정을 시작해볼까요.",
                "안녕하세요! 제대로 찾아오셨네요. 시작합시다!"
            ]
        },
        "welcomeBack": {
            "variations": [
                "다시 오신 것을 환영합니다! 😊",
                "이봐요, 기억해요! 다시 오신 것을 환영합니다!",
                "다시 만나서 반가워요!",
                "또 오셨네요! 환영합니다!"
            ]
        },
        "acknowledge": {
            "variations": [
                "감사합니다! 잠시만요...",
                "좋아요, 확인 중...",
                "잠시만요, 확인하고 있습니다...",
                "받았습니다! 빠른 확인..."
            ]
        },
        "checking": {
            "variations": [
                "<strong>{email}</strong> 찾는 중...",
                "<strong>{email}</strong> 확인 중...",
                "시스템에서 <strong>{email}</strong> 확인 중...",
                "잠시만요, <strong>{email}</strong> 찾는 중..."
            ]
        },
        "wrongFormat": {
            "variations": [
                "흠, 유효한 이메일처럼 보이지 않네요. 다시 시도해볼까요?",
                "이런! 잘못된 이메일 형식입니다. 다시 확인해볼까요?",
                "해당 이메일에 문제가 있습니다. 확인해주시겠어요?",
                "이메일 형식이 이상해 보이네요. 다시 확인해볼까요?"
            ]
        },
        "userNotRegistered": {
            "variations": [
                "여기 처음이신 것 같네요! 흥미진진한데요. 가입하시겠어요?",
                "시스템에서 아직 못 찾았어요. 시작할 준비되셨나요?",
                "새로운 얼굴이네요! 계정을 만들고 싶으신가요?",
                "아직 등록되지 않으셨네요. 바꿔볼까요?"
            ]
        },
        "askName": {
            "variations": [
                "좋은 선택입니다! 이름이 뭐예요?",
                "완벽해요! 뭐라고 부르면 될까요?",
                "멋져요! 이름을 알려주세요.",
                "좋아요! 이름이 뭐예요?"
            ]
        },
        "loginPrompt": {
            "variations": [
                "다시 오신 것을 환영합니다! 이메일이 뭐예요?",
                "다시 만나서 반가워요! 이메일을 입력하세요.",
                "로그인합시다. 이메일이 뭐예요?",
                "로그인할 준비되셨나요? 이메일을 공유해주세요."
            ]
        },
        "passwordPrompt": {
            "variations": [
                "찾았어요! 이제 비밀번호를 입력하세요.",
                "발견했습니다! 비밀번호가 뭐예요?",
                "거기 있었네요! 계속하려면 비밀번호를 입력하세요.",
                "알겠습니다! 이제 비밀번호를 입력해주세요."
            ]
        },
        "passwordCreate": {
            "message": "완벽해요! 이제 계정을 보호합시다. 비밀번호를 만드세요 (최소 8자):"
        },
        "passwordTooShort": {
            "message": "비밀번호는 최소 8자 이상이어야 합니다. 다시 시도해볼까요?"
        },
        "nameRequired": {
            "message": "계속하려면 이름이 필요해요. 이름이 뭐예요?"
        },
        "errors": {
            "generic": "이런! 문제가 발생했습니다. 다시 시도해주세요.",
            "emailCheck": "이메일 확인 실패",
            "loginFailed": "로그인 실패. 자격 증명을 확인하세요.",
            "signupFailed": "가입 실패. 다시 시도해주세요."
        }
    },
    'th-TH': {  # Thai
        "welcome": {
            "variations": [
                "สวัสดี! 👋 ยินดีต้อนรับสู่ iLaunching เริ่มกันเลยไหม?",
                "เฮ้! พร้อมที่จะเริ่มสิ่งที่ยอดเยี่ยมแล้วหรือยัง?",
                "ยินดีต้อนรับ! มาเริ่มการเดินทางของคุณกันเถอะ",
                "สวัสดี! คุณมาถูกที่แล้ว เริ่มกันเลย!"
            ]
        },
        "welcomeBack": {
            "variations": [
                "ยินดีต้อนรับกลับมา! 😊",
                "เฮ้ ฉันจำคุณได้! ยินดีต้อนรับกลับมา!",
                "ดีใจที่ได้เจอคุณอีกครั้ง!",
                "คุณกลับมาอีกแล้ว! ยินดีต้อนรับ!"
            ]
        },
        "acknowledge": {
            "variations": [
                "ขอบคุณ! สักครู่...",
                "เยี่ยม กำลังตรวจสอบ...",
                "สักวินาที กำลังตรวจสอบ...",
                "ได้รับแล้ว! ตรวจสอบอย่างรวดเร็ว..."
            ]
        },
        "checking": {
            "variations": [
                "กำลังค้นหา <strong>{email}</strong>...",
                "กำลังตรวจสอบ <strong>{email}</strong>...",
                "กำลังตรวจสอบ <strong>{email}</strong> ในระบบ...",
                "สักครู่ กำลังค้นหา <strong>{email}</strong>..."
            ]
        },
        "wrongFormat": {
            "variations": [
                "อืม นี่ดูไม่เหมือนอีเมลที่ถูกต้อง ลองอีกครั้งไหม?",
                "อ๊ะ! รูปแบบอีเมลไม่ถูกต้อง ตรวจสอบอีกครั้งไหม?",
                "มีบางอย่างผิดปกติกับอีเมลนั้น คุณช่วยตรวจสอบได้ไหม?",
                "รูปแบบอีเมลดูแปลกๆ ตรวจสอบอีกครั้งไหม?"
            ]
        },
        "userNotRegistered": {
            "variations": [
                "ดูเหมือนคุณจะเป็นคนใหม่ที่นี่! น่าตื่นเต้นมาก อยากเข้าร่วมไหม?",
                "ฉันยังไม่เห็นคุณในระบบ พร้อมที่จะเริ่มต้นหรือยัง?",
                "หน้าใหม่! อยากสร้างบัญชีไหม?",
                "คุณยังไม่ได้ลงทะเบียน เราจะเปลี่ยนแปลงไหม?"
            ]
        },
        "askName": {
            "variations": [
                "เลือกได้ดีมาก! ชื่อของคุณคืออะไร?",
                "สุดยอด! ฉันควรเรียกคุณว่าอะไร?",
                "เยี่ยมมาก! บอกชื่อของคุณหน่อย",
                "ดีมาก! ชื่อของคุณคืออะไร?"
            ]
        },
        "loginPrompt": {
            "variations": [
                "ยินดีต้อนรับกลับมา! อีเมลของคุณคืออะไร?",
                "ดีใจที่ได้เจอคุณอีกครั้ง! ใส่อีเมลของคุณ",
                "มาล็อกอินกัน อีเมลของคุณคืออะไร?",
                "พร้อมล็อกอินแล้วหรือยัง? แชร์อีเมลของคุณ"
            ]
        },
        "passwordPrompt": {
            "variations": [
                "ฉันเห็นคุณแล้ว! ตอนนี้ใส่รหัสผ่านของคุณ",
                "เจอแล้ว! รหัสผ่านของคุณคืออะไร?",
                "อยู่ตรงนั้น! ใส่รหัสผ่านเพื่อดำเนินการต่อ",
                "เข้าใจแล้ว! ตอนนี้รหัสผ่านของคุณค่ะ"
            ]
        },
        "passwordCreate": {
            "message": "สุดยอด! ตอนนี้มาปกป้องบัญชีของคุณกันเถอะ สร้างรหัสผ่าน (อย่างน้อย 8 ตัวอักษร):"
        },
        "passwordTooShort": {
            "message": "รหัสผ่านของคุณต้องมีอย่างน้อย 8 ตัวอักษร ลองอีกครั้งไหม?"
        },
        "nameRequired": {
            "message": "ฉันต้องการชื่อของคุณเพื่อดำเนินการต่อ ชื่อของคุณคืออะไร?"
        },
        "errors": {
            "generic": "อ๊ะ! มีบางอย่างผิดพลาด กรุณาลองอีกครั้ง",
            "emailCheck": "ตรวจสอบอีเมลล้มเหลว",
            "loginFailed": "ล็อกอินล้มเหลว ตรวจสอบข้อมูลประจำตัวของคุณ",
            "signupFailed": "การลงทะเบียนล้มเหลว กรุณาลองอีกครั้ง"
        }
    },
    'vi-VN': {  # Vietnamese
        "welcome": {
            "variations": [
                "Xin chào! 👋 Chào mừng đến với iLaunching. Bắt đầu nhé?",
                "Này! Sẵn sàng bắt đầu điều gì đó tuyệt vời chưa?",
                "Chào mừng! Hãy bắt đầu hành trình của bạn.",
                "Xin chào! Bạn đã đến đúng nơi rồi. Bắt đầu thôi!"
            ]
        },
        "welcomeBack": {
            "variations": [
                "Chào mừng trở lại! 😊",
                "Này, tôi nhớ bạn! Chào mừng trở lại!",
                "Rất vui được gặp lại bạn!",
                "Bạn lại đây rồi! Chào mừng!"
            ]
        },
        "acknowledge": {
            "variations": [
                "Cảm ơn! Chờ một chút...",
                "Hoàn hảo, đang kiểm tra...",
                "Một giây, đang xác minh...",
                "Đã nhận! Kiểm tra nhanh..."
            ]
        },
        "checking": {
            "variations": [
                "Đang tìm kiếm <strong>{email}</strong>...",
                "Đang kiểm tra <strong>{email}</strong>...",
                "Đang kiểm tra <strong>{email}</strong> trong hệ thống...",
                "Chờ một chút, đang tìm kiếm <strong>{email}</strong>..."
            ]
        },
        "wrongFormat": {
            "variations": [
                "Hmm, đây không giống email hợp lệ. Thử lại nhé?",
                "Ối! Định dạng email không hợp lệ. Kiểm tra lại nhé?",
                "Có vấn đề với email đó. Bạn có thể kiểm tra không?",
                "Định dạng email đó trông lạ. Kiểm tra lại nhé?"
            ]
        },
        "userNotRegistered": {
            "variations": [
                "Có vẻ như bạn mới ở đây! Thật thú vị. Muốn tham gia không?",
                "Tôi chưa thấy bạn trong hệ thống. Sẵn sàng bắt đầu chưa?",
                "Gương mặt mới! Muốn tạo tài khoản không?",
                "Bạn chưa đăng ký. Chúng ta thay đổi điều đó nhé?"
            ]
        },
        "askName": {
            "variations": [
                "Lựa chọn tuyệt vời! Tên bạn là gì?",
                "Hoàn hảo! Tôi nên gọi bạn là gì?",
                "Tuyệt vời! Cho tôi biết tên bạn.",
                "Tốt! Tên bạn là gì?"
            ]
        },
        "loginPrompt": {
            "variations": [
                "Chào mừng trở lại! Email của bạn là gì?",
                "Rất vui được gặp lại bạn! Nhập email của bạn.",
                "Hãy đăng nhập. Email của bạn là gì?",
                "Sẵn sàng đăng nhập? Chia sẻ email của bạn."
            ]
        },
        "passwordPrompt": {
            "variations": [
                "Tôi thấy bạn rồi! Bây giờ nhập mật khẩu của bạn.",
                "Tìm thấy rồi! Mật khẩu của bạn là gì?",
                "Bạn đây rồi! Nhập mật khẩu để tiếp tục.",
                "Hiểu rồi! Bây giờ mật khẩu của bạn, làm ơn."
            ]
        },
        "passwordCreate": {
            "message": "Hoàn hảo! Bây giờ hãy bảo mật tài khoản của bạn. Tạo mật khẩu (ít nhất 8 ký tự):"
        },
        "passwordTooShort": {
            "message": "Mật khẩu của bạn cần ít nhất 8 ký tự. Thử lại nhé?"
        },
        "nameRequired": {
            "message": "Tôi cần tên của bạn để tiếp tục. Tên bạn là gì?"
        },
        "errors": {
            "generic": "Ối! Có lỗi xảy ra. Vui lòng thử lại.",
            "emailCheck": "Kiểm tra email thất bại",
            "loginFailed": "Đăng nhập thất bại. Kiểm tra thông tin đăng nhập của bạn.",
            "signupFailed": "Đăng ký thất bại. Vui lòng thử lại."
        }
    },
    'id-ID': {  # Indonesian
        "welcome": {
            "variations": [
                "Halo! 👋 Selamat datang di iLaunching. Mulai?",
                "Hei! Siap memulai sesuatu yang luar biasa?",
                "Selamat datang! Mari mulai perjalanan Anda.",
                "Halo! Anda berada di tempat yang tepat. Ayo mulai!"
            ]
        },
        "welcomeBack": {
            "variations": [
                "Selamat datang kembali! 😊",
                "Hei, saya ingat Anda! Selamat datang kembali!",
                "Senang bertemu lagi!",
                "Anda di sini lagi! Selamat datang!"
            ]
        },
        "acknowledge": {
            "variations": [
                "Terima kasih! Sebentar...",
                "Sempurna, memeriksa...",
                "Sedetik, memverifikasi...",
                "Diterima! Pemeriksaan cepat..."
            ]
        },
        "checking": {
            "variations": [
                "Mencari <strong>{email}</strong>...",
                "Memeriksa <strong>{email}</strong>...",
                "Memeriksa <strong>{email}</strong> di sistem...",
                "Sebentar, mencari <strong>{email}</strong>..."
            ]
        },
        "wrongFormat": {
            "variations": [
                "Hmm, ini tidak terlihat seperti email yang valid. Coba lagi?",
                "Ups! Format email tidak valid. Periksa lagi?",
                "Ada yang salah dengan email itu. Bisa Anda periksa?",
                "Format email itu terlihat aneh. Periksa lagi?"
            ]
        },
        "userNotRegistered": {
            "variations": [
                "Sepertinya Anda baru di sini! Ini menarik. Ingin bergabung?",
                "Saya belum melihat Anda di sistem. Siap untuk mulai?",
                "Wajah baru! Ingin membuat akun?",
                "Anda belum terdaftar. Kita ubah itu?"
            ]
        },
        "askName": {
            "variations": [
                "Pilihan bagus! Siapa nama Anda?",
                "Sempurna! Apa yang harus saya panggil Anda?",
                "Luar biasa! Beri tahu nama Anda.",
                "Bagus! Siapa nama Anda?"
            ]
        },
        "loginPrompt": {
            "variations": [
                "Selamat datang kembali! Apa email Anda?",
                "Senang bertemu lagi! Masukkan email Anda.",
                "Mari masuk. Apa email Anda?",
                "Siap untuk masuk? Bagikan email Anda."
            ]
        },
        "passwordPrompt": {
            "variations": [
                "Saya melihat Anda! Sekarang masukkan kata sandi Anda.",
                "Ketemu! Apa kata sandi Anda?",
                "Anda di sana! Masukkan kata sandi untuk melanjutkan.",
                "Mengerti! Sekarang kata sandi Anda, silakan."
            ]
        },
        "passwordCreate": {
            "message": "Sempurna! Sekarang mari amankan akun Anda. Buat kata sandi (minimal 8 karakter):"
        },
        "passwordTooShort": {
            "message": "Kata sandi Anda harus minimal 8 karakter. Coba lagi?"
        },
        "nameRequired": {
            "message": "Saya perlu nama Anda untuk melanjutkan. Siapa nama Anda?"
        },
        "errors": {
            "generic": "Ups! Ada yang salah. Silakan coba lagi.",
            "emailCheck": "Pemeriksaan email gagal",
            "loginFailed": "Masuk gagal. Periksa kredensial Anda.",
            "signupFailed": "Pendaftaran gagal. Silakan coba lagi."
        }
    }
}

locales_dir = 'public/locales'

for lang_code, translations in phase2_translations.items():
    lang_dir = os.path.join(locales_dir, lang_code)
    landing_path = os.path.join(lang_dir, 'landing.json')
    
    with open(landing_path, 'w', encoding='utf-8') as f:
        json.dump(translations, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Created {lang_code}/landing.json")

print(f"\n🎉 Phase 2 complete! Created landing.json for {len(phase2_translations)} languages")
