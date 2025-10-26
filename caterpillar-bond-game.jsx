import React, { useState, useEffect, useRef } from 'react';

export default function CaterpillarBondGame() {
  const [totalSquashes, setTotalSquashes] = useState(0);
  const [animationState, setAnimationState] = useState('idle');
  const [spriteFrame, setSpriteFrame] = useState(0);
  const [caterpillar, setCaterpillar] = useState(null);
  const [isSquashing, setIsSquashing] = useState(false);
  const [slowMotion, setSlowMotion] = useState(false);
  const [dialogue, setDialogue] = useState('');
  const [showDialogue, setShowDialogue] = useState(false);
  const [satisfactionGauge, setSatisfactionGauge] = useState(0);
  const [floatingText, setFloatingText] = useState([]);
  const [relationshipLevel, setRelationshipLevel] = useState(0);
  const audioContextRef = useRef(null);

  // 関係性レベルの計算
  useEffect(() => {
    const level = Math.floor(totalSquashes / 5);
    setRelationshipLevel(level);
  }, [totalSquashes]);

  // Web Audio APIの初期化
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  // つぶされ効果音
  const playSquashSound = () => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  };

  // 出現時のセリフ（穏やかな男性推しキャラが青虫くんに話しかける）
  const getAppearanceDialogue = (count, level) => {
    if (count === 0) {
      return '…可愛い青虫だね';
    }
    
    const dialogues = {
      0: [ // 0-4回（初対面〜知り合い）
        '…また来たんだね',
        '…そこにいたのか',
        '…おいで',
        '…よく来たね',
      ],
      1: [ // 5-9回（親しくなってきた）
        '…待ってたよ',
        '…また会えたね',
        '…いい子だね',
        '…今日も来てくれたんだね',
        '…嬉しいよ',
      ],
      2: [ // 10-14回（信頼関係）
        '…君は可愛いね',
        '…もう離れられないみたいだ',
        '…特別な存在だよ',
        '…君のこと、好きだよ',
        '…大切にするからね',
      ],
      3: [ // 15-19回（深い絆）
        '…君は僕のものだよ',
        '…愛おしいな',
        '…ずっと一緒にいよう',
        '…君だけを見てる',
        '…とても大事な子だ',
      ],
      4: [ // 20回以上（運命の相手）
        '…運命を感じるよ',
        '…君は僕の宝物だ',
        '…永遠に君のそばに',
        '…この瞬間が愛しい',
        '…完璧な関係だね',
        '…君に出会えてよかった',
      ],
    };
    
    const levelDialogues = dialogues[Math.min(level, 4)];
    return levelDialogues[count % levelDialogues.length];
  };

  // つぶす時のセリフ（穏やかな男性推しキャラが青虫くんに言う言葉）
  const getSquashDialogue = (level) => {
    const dialogues = {
      0: [
        '…いい子だね',
        '…可愛いよ',
        '…よくできました',
        '…素直だね',
        '…いい感じだ',
      ],
      1: [
        '…気持ちよさそうだね',
        '…もっと…',
        '…素敵だよ',
        '…とても素直だ',
        '…完璧だ',
      ],
      2: [
        '…愛してるよ',
        '…完璧…',
        '…君だけだよ',
        '…最高に可愛い',
        '…理想的な青虫だ',
        '…君は特別だよ',
      ],
      3: [
        '…たまらないね',
        '…最高の瞬間だ',
        '…幸せ…',
        '…完璧なつぶされっぷり',
        '…もっとつぶしてあげる',
        '…ご褒美あげる',
      ],
      4: [
        '…永遠にこうしていたい',
        '…運命だね',
        '…これが愛だよ',
        '…君は僕だけのもの',
        '…至福のひととき',
        '…最高に幸せだ',
      ],
    };
    
    const levelDialogues = dialogues[Math.min(level, 4)];
    return levelDialogues[Math.floor(Math.random() * levelDialogues.length)];
  };

  // 関係性の説明
  const getRelationshipStatus = (level) => {
    const statuses = [
      '出会ったばかり',
      '知り合い',
      '親しい仲',
      '信頼し合う関係',
      '深い絆',
      '運命の相手',
    ];
    return statuses[Math.min(level, 5)];
  };

  // アニメーションフレームの切り替え
  useEffect(() => {
    const speed = slowMotion ? 200 : (animationState === 'attack' ? 100 : 500);
    const interval = setInterval(() => {
      if (animationState === 'idle') {
        setSpriteFrame((prev) => (prev + 1) % 2);
      } else if (animationState === 'attack') {
        setSpriteFrame((prev) => {
          const next = prev + 1;
          if (next >= 3) {
            setAnimationState('idle');
            setSlowMotion(false);
            return 0;
          }
          return next;
        });
      }
    }, speed);

    return () => clearInterval(interval);
  }, [animationState, slowMotion]);

  // 青虫の出現管理
  useEffect(() => {
    if (!caterpillar && !isSquashing) {
      const timer = setTimeout(() => {
        const x = Math.random() * 60 + 20;
        const y = Math.random() * 30 + 55;
        
        setCaterpillar({ x, y });
        
        // 出現時のセリフ
        const appearDialogue = getAppearanceDialogue(totalSquashes, relationshipLevel);
        setDialogue(appearDialogue);
        setShowDialogue(true);
        setTimeout(() => setShowDialogue(false), 3000);
      }, totalSquashes === 0 ? 500 : 2000);
      
      return () => clearTimeout(timer);
    }
  }, [caterpillar, isSquashing, totalSquashes, relationshipLevel]);

  // 満足度ゲージの減衰
  useEffect(() => {
    const interval = setInterval(() => {
      setSatisfactionGauge((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCaterpillarClick = () => {
    if (isSquashing || !caterpillar) return;
    
    // スローモーション開始
    setSlowMotion(true);
    setAnimationState('attack');
    setSpriteFrame(0);
    setIsSquashing(true);
    
    // 効果音
    playSquashSound();
    
    // カウント更新
    const newCount = totalSquashes + 1;
    setTotalSquashes(newCount);
    
    // 満足度アップ
    setSatisfactionGauge((prev) => Math.min(100, prev + 20));
    
    // つぶされた時のセリフ
    const squashDialogue = getSquashDialogue(relationshipLevel);
    setDialogue(squashDialogue);
    setShowDialogue(true);
    setTimeout(() => setShowDialogue(false), 2000);
    
    // フローティングテキスト
    const textId = Date.now();
    setFloatingText((prev) => [...prev, { id: textId, x: caterpillar.x, y: caterpillar.y, text: '💚' }]);
    setTimeout(() => {
      setFloatingText((prev) => prev.filter((t) => t.id !== textId));
    }, 1000);
    
    // 青虫を削除して再出現を待つ
    setTimeout(() => {
      setCaterpillar(null);
      setIsSquashing(false);
    }, slowMotion ? 600 : 300);
  };

  // キャラクタースプライト（右上から見下ろす）
  const getCharacterSprite = () => {
    const baseClass = "transition-all duration-200";
    
    if (animationState === 'idle') {
      return spriteFrame === 0 ? (
        <div className={`relative w-28 h-36 ${baseClass}`} style={{ transform: 'perspective(200px) rotateX(15deg)' }}>
          <div className="absolute inset-0 bg-gradient-to-b from-purple-400 to-purple-600 rounded-2xl shadow-lg">
            <div className="absolute top-6 left-5 w-5 h-5 bg-white rounded-full border-2 border-purple-900">
              <div className="absolute top-1 right-1 w-2 h-2 bg-purple-900 rounded-full"></div>
            </div>
            <div className="absolute top-6 right-5 w-5 h-5 bg-white rounded-full border-2 border-purple-900">
              <div className="absolute top-1 right-1 w-2 h-2 bg-purple-900 rounded-full"></div>
            </div>
            <div className="absolute bottom-12 left-9 w-10 h-3 bg-pink-400 rounded-full"></div>
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-3xl">👆</div>
          </div>
        </div>
      ) : (
        <div className={`relative w-28 h-36 ${baseClass} translate-y-1`} style={{ transform: 'perspective(200px) rotateX(15deg) translateY(4px)' }}>
          <div className="absolute inset-0 bg-gradient-to-b from-purple-400 to-purple-600 rounded-2xl shadow-lg">
            <div className="absolute top-6 left-5 w-5 h-5 bg-white rounded-full border-2 border-purple-900">
              <div className="absolute top-1 right-1 w-2 h-2 bg-purple-900 rounded-full"></div>
            </div>
            <div className="absolute top-6 right-5 w-5 h-5 bg-white rounded-full border-2 border-purple-900">
              <div className="absolute top-1 right-1 w-2 h-2 bg-purple-900 rounded-full"></div>
            </div>
            <div className="absolute bottom-12 left-9 w-10 h-2 bg-pink-400 rounded-full"></div>
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-3xl">👆</div>
          </div>
        </div>
      );
    } else {
      const frames = [
        <div className={`relative w-28 h-36 ${baseClass} -translate-y-3`} style={{ transform: 'perspective(200px) rotateX(20deg) translateY(-12px)' }}>
          <div className="absolute inset-0 bg-gradient-to-b from-purple-400 to-purple-600 rounded-2xl shadow-lg">
            <div className="absolute top-5 left-5 w-6 h-6 bg-white rounded-full border-2 border-purple-900">
              <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-purple-900 rounded-full"></div>
            </div>
            <div className="absolute top-5 right-5 w-6 h-6 bg-white rounded-full border-2 border-purple-900">
              <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-purple-900 rounded-full"></div>
            </div>
            <div className="absolute bottom-12 left-8 w-12 h-4 bg-pink-400 rounded-full"></div>
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-4xl">👇</div>
          </div>
        </div>,
        <div className={`relative w-28 h-36 ${baseClass} translate-y-6 scale-y-90`} style={{ transform: 'perspective(200px) rotateX(25deg) translateY(24px) scaleY(0.9)' }}>
          <div className="absolute inset-0 bg-gradient-to-b from-purple-400 to-purple-600 rounded-2xl shadow-xl">
            <div className="absolute top-3 left-5 w-7 h-7 bg-white rounded-full border-2 border-purple-900">
              <div className="absolute top-2 right-2 w-3 h-3 bg-purple-900 rounded-full"></div>
            </div>
            <div className="absolute top-3 right-5 w-7 h-7 bg-white rounded-full border-2 border-purple-900">
              <div className="absolute top-2 right-2 w-3 h-3 bg-purple-900 rounded-full"></div>
            </div>
            <div className="absolute bottom-10 left-7 w-14 h-5 bg-yellow-400 rounded-full shadow-inner"></div>
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-5xl">👇</div>
          </div>
        </div>,
        <div className={`relative w-28 h-36 ${baseClass} translate-y-10 scale-y-75`} style={{ transform: 'perspective(200px) rotateX(30deg) translateY(40px) scaleY(0.75)' }}>
          <div className="absolute inset-0 bg-gradient-to-b from-purple-400 to-purple-600 rounded-2xl shadow-2xl">
            <div className="absolute top-2 left-4 w-8 h-8 bg-white rounded-full border-2 border-purple-900">
              <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 bg-purple-900 rounded-full"></div>
            </div>
            <div className="absolute top-2 right-4 w-8 h-8 bg-white rounded-full border-2 border-purple-900">
              <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 bg-purple-900 rounded-full"></div>
            </div>
            <div className="absolute bottom-8 left-5 w-18 h-6 bg-red-500 rounded-full shadow-inner"></div>
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-6xl opacity-90">👇</div>
          </div>
        </div>
      ];
      return frames[spriteFrame];
    }
  };

  return (
    <div className={`w-full h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-amber-50 overflow-hidden relative ${slowMotion ? 'animate-pulse' : ''}`}>
      
      {/* テーブルエリア（画面下半分） */}
      <div className="absolute top-1/2 left-0 w-full h-1/2 bg-gradient-to-b from-amber-100 via-amber-200 to-amber-300 shadow-inner">
        {/* 木目調の質感 */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full" style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 35px, rgba(139,69,19,0.1) 35px, rgba(139,69,19,0.1) 37px)',
          }}></div>
        </div>
        {/* テーブルのハイライト */}
        <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-white to-transparent opacity-30"></div>
      </div>

      {/* ステータス表示 */}
      <div className="absolute top-4 left-4 bg-white px-4 py-3 rounded-2xl shadow-xl z-10 border-4 border-purple-300">
        <div className="text-xs text-gray-600 font-bold">💚 つぶした回数</div>
        <div className="text-3xl font-bold text-purple-600 mb-1">{totalSquashes}</div>
        <div className="text-xs text-pink-600 font-bold border-t pt-1 border-pink-200">
          {getRelationshipStatus(relationshipLevel)}
        </div>
      </div>

      {/* 満足度ゲージ */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-40 z-10">
        <div className="bg-white px-3 py-2 rounded-2xl shadow-xl border-4 border-pink-300">
          <div className="text-xs text-gray-600 font-bold mb-1 text-center">
            💖 満足度
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-400 via-purple-400 to-pink-500 transition-all duration-500"
              style={{ width: `${satisfactionGauge}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* セリフ吹き出し */}
      {showDialogue && (
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 z-20 animate-bounce px-4">
          <div className="bg-white px-6 py-3 rounded-2xl shadow-2xl text-base font-bold text-purple-600 text-center border-4 border-pink-300 max-w-xs">
            {dialogue}
          </div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-pink-300"></div>
        </div>
      )}

      {/* フローティングテキスト */}
      {floatingText.map((text) => (
        <div
          key={text.id}
          className="absolute text-4xl animate-ping pointer-events-none z-20"
          style={{
            left: `${text.x}%`,
            top: `${text.y}%`,
          }}
        >
          {text.text}
        </div>
      ))}

      {/* キャラクター（右上からテーブルを見下ろす） */}
      <div className="absolute top-8 right-4 z-20">
        {getCharacterSprite()}
      </div>

      {/* 青虫くん（特別な1匹） */}
      {caterpillar && (
        <div
          onClick={handleCaterpillarClick}
          className={`absolute cursor-pointer transition-all ${
            slowMotion ? 'duration-500' : 'duration-300'
          } ${
            isSquashing ? 'scale-0 rotate-180 opacity-0' : 'hover:scale-125 hover:brightness-110'
          }`}
          style={{
            left: `${caterpillar.x}%`,
            top: `${caterpillar.y}%`,
          }}
        >
          {isSquashing ? (
            <div className="relative">
              <div className="w-20 h-6 bg-gradient-to-r from-green-800 to-green-900 rounded-full opacity-70 blur-sm"></div>
              <div className="absolute -top-4 left-0 text-4xl animate-spin">💥</div>
              <div className="absolute -top-2 left-6 text-2xl">💚</div>
            </div>
          ) : (
            <div className="relative animate-bounce">
              {/* テーブルの上にいる影 */}
              <div className="absolute -bottom-1 left-2 w-20 h-2 bg-black opacity-20 rounded-full blur-sm"></div>
              <div className="flex items-center gap-1 drop-shadow-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-green-300 via-green-400 to-green-600 rounded-full border-2 border-green-700 shadow-lg relative">
                  {/* 目 */}
                  <div className="absolute top-2 left-2 w-2 h-2 bg-black rounded-full"></div>
                  <div className="absolute top-1.5 left-1.5 w-0.5 h-0.5 bg-white rounded-full"></div>
                  {/* 口 */}
                  <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-pink-400 rounded-full"></div>
                </div>
                <div className="w-7 h-7 bg-gradient-to-br from-green-300 via-green-400 to-green-600 rounded-full border-2 border-green-700"></div>
                <div className="w-6 h-6 bg-gradient-to-br from-green-300 via-green-400 to-green-600 rounded-full border-2 border-green-700"></div>
                <div className="w-5 h-5 bg-gradient-to-br from-green-300 via-green-400 to-green-600 rounded-full border-2 border-green-700"></div>
              </div>
              {/* ハート */}
              {relationshipLevel >= 2 && (
                <div className="absolute -top-6 right-0 text-xl animate-pulse">💕</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 説明 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 px-4 py-2 rounded-full shadow-lg text-xs text-gray-600 z-10">
        🐛 何度でも戻ってくる青虫くん
      </div>
    </div>
  );
}
