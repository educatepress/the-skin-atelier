import {
	AbsoluteFill,
	Audio,
	Sequence,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
	spring,
	interpolate,
	Easing,
	OffthreadVideo,
} from 'remotion';
import React from 'react';
import { WordByWordText } from './components/WordByWordText';
import { InfographicChart } from './components/InfographicChart';
import { ThumbnailCard } from './components/ThumbnailCard';
import type { ReelData } from './schema';
import { TYPE, FONT, LAYOUT, COLOR, MOTION, CANVAS } from './design-system';


/**
 * ═══════════════════════════════════════════════════════════════
 *  ReelComposition — Cinematic Premium Layout v3
 *
 *  Design principles:
 *  1. Rule of Thirds — text anchored at upper 1/3 (640px)
 *  2. Breathing Negative Space — 103px+ margins
 *  3. Safe Zone Enforcement — bottom 30%, right 20%
 *  4. Heartbeat Dip — warm cinematic pause, not aggressive glitch
 *  5. Audio: ElevenLabs voiceover + BGM ducking
 *  6. Everything whispers "I'm a trustworthy expert who cares"
 * ═══════════════════════════════════════════════════════════════
 */
export const ReelComposition: React.FC<ReelData> = ({
	hook,
	words,
	dropFrame,
	bRollFrame,
	voiceoverUrl,
	bgmUrl,
	keyTakeaway,
	infographic,
	thumbnailText,
}) => {
	const frame = useCurrentFrame();
	const { fps, durationInFrames } = useVideoConfig();

	// インフォグラフィックのタイミング計算は offsetWords 後に移動（下記）


	// ── Timeline ──
	const THUMBNAIL_DURATION = 60; // 2秒（サムネイルカード）
	const hookEndFrame = THUMBNAIL_DURATION + Math.round(1.5 * fps); // サムネ終了後にフックテキスト開始

	// ── テロップ同期: 全wordのstartFrame/endFrameにTHUMBNAIL_DURATIONを加算 ──
	const offsetWords = words.map(w => ({
		...w,
		startFrame: w.startFrame + THUMBNAIL_DURATION,
		endFrame: w.endFrame + THUMBNAIL_DURATION,
	}));

	const { heartbeatDip, heartbeatPulse } = MOTION;
	const dipStart = dropFrame - heartbeatPulse.durationFrames;
	const dipTotalFrames = heartbeatDip.fadeInFrames + heartbeatDip.holdFrames + heartbeatDip.fadeOutFrames;
	const dropEndFrame = dropFrame + dipTotalFrames;

	// ── グラフ出現タイミングの自動同期（4段構え検知） ──
	let infographicStartFrame = dropFrame;
	if (infographic && offsetWords.length > 0) {
		let triggerWord;
		if (infographic.type === 'comparison') {
			triggerWord = offsetWords.find(w => w.text.includes(String(infographic.group1Value)) || w.text.includes(String(infographic.group2Value)));
		} else if (infographic.type === 'single_value') {
			triggerWord = offsetWords.find(w => w.text.includes(String(infographic.mainValue)));
		}
		
		if (!triggerWord && 'metricLabel' in infographic && infographic.metricLabel) {
			const metricKeywords = infographic.metricLabel.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
			triggerWord = offsetWords.find(w => w.startFrame > hookEndFrame + 30 && metricKeywords.some((kw: string) => w.text.toLowerCase().includes(kw)));
		}
		
		if (!triggerWord) {
			const signalWords = ["percent", "rate", "rates", "data", "study", "research", "increase", "improve", "difference", "impact"];
			triggerWord = offsetWords.find(w => w.startFrame > hookEndFrame + 60 && signalWords.some(sw => w.text.toLowerCase().includes(sw)));
		}
		if (triggerWord) {
			infographicStartFrame = Math.max(hookEndFrame, triggerWord.startFrame - 15);
		} else {
			infographicStartFrame = Math.max(hookEndFrame, dropFrame - 90);
		}
	}
	// グラフの寿命を「暗転完了(dropEndFrame)」まで延長し、ブツ切りを防ぐ
	const INFOGRAPHIC_DURATION = infographic ? Math.max(30, dropEndFrame - infographicStartFrame) : 0;
	const infographicEndFrame = infographicStartFrame + INFOGRAPHIC_DURATION;

	// ── テロップ退避アニメーション（グラフが出たら上へスライド＆縮小）──
	const textOffsetY = infographic ? interpolate(
		frame,
		[infographicStartFrame, infographicStartFrame + 15],
		[0, -420], // グラフと被らないようさらに上へ退避
		{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.ease) }
	) : 0;

	const textScale = infographic ? interpolate(
		frame,
		[infographicStartFrame, infographicStartFrame + 15],
		[1.0, 0.75], // テロップを少し小さくして目立たなくする
		{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.ease) }
	) : 1;

	// ── 暗転に合わせてテロップとグラフを美しくフェードアウト ──
	const fadeOutOpacity = interpolate(
		frame,
		[dropFrame, dropFrame + heartbeatDip.fadeInFrames],
		[1, 0],
		{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
	);

	// ── Progress Bar (0 → 100%) ──
	const progressWidth = interpolate(frame, [0, durationInFrames], [0, 100]);

	// ── Hook Text: Overshoot Spring ──
	const hookScale = spring({
		frame: Math.max(0, frame - THUMBNAIL_DURATION),
		fps,
		config: MOTION.hookSpring,
	});

	// ── Hook decorative line ──
	const hookLineWidth = interpolate(
		Math.max(0, frame - THUMBNAIL_DURATION),
		[8, 20],
		[0, 60],
		{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
	);

	// ── Ken Burns Effect (gentle slow zoom) ──
	const kenBurnsScale = interpolate(
		frame,
		[0, durationInFrames],
		[MOTION.kenBurns.startScale, MOTION.kenBurns.endScale],
		{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
	);

	// ── Subtle Background Warmth Cycle ──
	const bgHue = interpolate(
		frame,
		[0, durationInFrames / 3, (durationInFrames * 2) / 3, durationInFrames],
		[0, 5, -3, 0],
		{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
	);

	// ── Heartbeat Pulse (subtle scale anticipation before dip) ──
	const heartbeatScale = interpolate(
		frame,
		[
			dipStart,
			dipStart + heartbeatPulse.durationFrames / 2,
			dipStart + heartbeatPulse.durationFrames,
		],
		[1.0, heartbeatPulse.scale, 1.0],
		{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
	);

	// ── Heartbeat Dip to Black (smooth, warm, cinematic) ──
	const dipFadeIn = interpolate(
		frame,
		[dropFrame, dropFrame + heartbeatDip.fadeInFrames],
		[0, heartbeatDip.maxDarkness],
		{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
	);
	const dipHold = frame >= dropFrame + heartbeatDip.fadeInFrames &&
	                frame < dropFrame + heartbeatDip.fadeInFrames + heartbeatDip.holdFrames
		? heartbeatDip.maxDarkness : 0;
	const dipFadeOut = interpolate(
		frame,
		[
			dropFrame + heartbeatDip.fadeInFrames + heartbeatDip.holdFrames,
			dropFrame + dipTotalFrames,
		],
		[heartbeatDip.maxDarkness, 0],
		{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
	);
	// Compose: whichever is the dominant value at any given frame
	const bgDarkness = Math.max(dipFadeIn, dipHold, dipFadeOut);

	// ── Post-Drop Conclusion Animation ──
	const conclusionScale = frame >= infographicEndFrame
		? spring({
				frame: frame - infographicEndFrame,
				fps,
				config: MOTION.conclusionSpring,
			})
		: 0;
	const conclusionOpacity = interpolate(
		frame,
		[infographicEndFrame, infographicEndFrame + 10],
		[0, 1],
		{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
	);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: COLOR.bg,
				fontFamily: FONT.sans,
				overflow: 'hidden',
			}}
		>
			{/* ═══ BACKGROUND LAYER ═══ */}
			<AbsoluteFill
				style={{
					transform: `scale(${kenBurnsScale * heartbeatScale})`,
					filter: `hue-rotate(${bgHue}deg)`,
				}}
			>
				{/* Pexels Video A (Act 1-2) */}
				<Sequence durationInFrames={bRollFrame || Math.round(durationInFrames / 2)}>
					<OffthreadVideo
						src={staticFile('tmp/background.mp4')}
						style={{ objectFit: 'cover', width: '100%', height: '100%', opacity: 0.85 }}
						muted
					/>
				</Sequence>

				{/* Pexels Video B (Act 3-5) */}
				<Sequence from={bRollFrame || Math.round(durationInFrames / 2)}>
					<OffthreadVideo
						src={staticFile('tmp/background-b.mp4')}
						style={{ objectFit: 'cover', width: '100%', height: '100%', opacity: 0.85 }}
						muted
					/>
				</Sequence>

				{/* Radial gradient for dimensional depth and text readability */}
				<div
					style={{
						position: 'absolute',
						inset: 0,
						background: `radial-gradient(
							ellipse at 50% 35%,
							rgba(252,249,248,0.7) 0%,
							rgba(110,91,77,0.08) 50%,
							rgba(26,42,58,0.15) 100%
						)`,
					}}
				/>
			</AbsoluteFill>

			{/* ═══ HEARTBEAT DIP OVERLAY (replaces flicker) ═══ */}
			<AbsoluteFill
				style={{
					backgroundColor: `rgba(44, 62, 80, ${bgDarkness})`, // Dark charcoal, not pure black
					zIndex: 90, // グラフやテロップも一緒に暗転させる
					pointerEvents: 'none',
					// Use CSS transition for silk-smooth dip feel
					transition: 'background-color 0.05s ease',
				}}
			/>
			{/* ═══ PREMIUM THUMBNAIL CARD (0s → 2s) ═══ */}
			{thumbnailText && (
				<ThumbnailCard thumbnailText={thumbnailText} />
			)}

			{/* ═══ HOOK TEXT (サムネ終了後 → +1.5s) ═══ */}
			{/* Anchored at upper 1/3 (Rule of Thirds) */}
			{frame >= THUMBNAIL_DURATION && frame < hookEndFrame && (
				<div
					style={{
						position: 'absolute',
						top: 0,
						left: LAYOUT.marginX,
						right: LAYOUT.marginX + LAYOUT.safeRight,
						height: CANVAS.height - LAYOUT.safeBottom,
						display: 'flex',
						flexDirection: 'column',
						// Align to upper 1/3 of the usable area
						justifyContent: 'flex-start',
						paddingTop: LAYOUT.thirdLineTop - TYPE.display / 2,
						zIndex: 9999,
					}}
				>
					<h1
						style={{
							transform: `scale(${hookScale})`,
							fontSize: TYPE.display,
							fontFamily: FONT.serif,
							color: '#6e5b4d', // モカブラウン
							textAlign: 'left', // Left-aligned for editorial feel
							lineHeight: 1.15,
							letterSpacing: '0.05em', // 和文に抜け感
							textShadow: '0 2px 8px rgba(110, 91, 77, 0.15)', // 静かなシャドウ
							margin: 0,
						}}
					>
						{hook}
					</h1>
					{/* Decorative accent line */}
					<div
						style={{
							width: hookLineWidth,
							height: 1, // エレガントな極細線
							backgroundColor: '#6e5b4d',
							borderRadius: 2,
							marginTop: 28,
							opacity: interpolate(frame, [5, 15], [0, 0.7], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
						}}
					/>
				</div>
			)}

			{/* ═══ INFOGRAPHIC OVERLAY（音声同期、暗転と共にフェードアウト）═══ */}
			{/* テロップの背面にするため、記述順序を先にします */}
			{infographic && (
				<Sequence from={infographicStartFrame} durationInFrames={INFOGRAPHIC_DURATION}>
					<AbsoluteFill style={{ zIndex: 15, opacity: fadeOutOpacity }}>
						<InfographicChart
							data={infographic}
							startFrame={0}
						/>
					</AbsoluteFill>
				</Sequence>
			)}

			{/* ═══ WORD-BY-WORD CONTENT（暗転完了まで表示、退避+フェードアウト付き）═══ */}
			{/* グラフの手前に表示するため、記述順序を後にします */}
			<Sequence from={hookEndFrame} durationInFrames={dropEndFrame - hookEndFrame}>
				<AbsoluteFill style={{ zIndex: 9999 }}>
					<WordByWordText
						words={offsetWords}
						frameOffset={hookEndFrame}
						offsetY={textOffsetY}
						scale={textScale}
						globalOpacity={fadeOutOpacity}
					/>
				</AbsoluteFill>
			</Sequence>

			{/* ═══ POST-DROP CONCLUSION ═══ */}
			{frame >= infographicEndFrame && (
				<div
					style={{
						position: 'absolute',
						top: 0,
						left: LAYOUT.marginX,
						right: LAYOUT.marginX + LAYOUT.safeRight,
						height: CANVAS.height - LAYOUT.safeBottom,
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'flex-start',
						paddingTop: LAYOUT.thirdLineTop - 80,
						alignItems: 'flex-start',
						zIndex: 9999,
					}}
				>
					{/* Conclusion card */}
					<div
						style={{
							transform: `scale(${conclusionScale})`,
							opacity: conclusionOpacity,
							backgroundColor: COLOR.white,
							padding: '40px 48px',
							borderRadius: 24,
							boxShadow: '0 12px 48px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
							maxWidth: LAYOUT.textMaxWidth,
						}}
					>
						<p
							style={{
								fontSize: TYPE.headline,
								fontFamily: FONT.serif,
								color: COLOR.text,
								lineHeight: 1.35,
								margin: 0,
								letterSpacing: '-0.01em',
							}}
						>
							{keyTakeaway ? (
								<>
									{keyTakeaway.split(' ').slice(0, -1).join(' ')}{' '}
									<span style={{ color: '#6e5b4d', fontWeight: 500 }}>
										{keyTakeaway.split(' ').slice(-1)}
									</span>
								</>
							) : (
								<>
									重要なのは <span style={{ color: '#333', fontWeight: 500 }}>回数</span>ではなく、<br />
									日々の <span style={{ color: '#6e5b4d', fontWeight: 500, borderBottom: '1px solid #6e5b4d' }}>正しい積み重ね</span> です。
								</>
							)}
						</p>
					</div>

					{/* CTA — appears 2s after conclusion */}
					{frame >= infographicEndFrame + 60 && (

						<p
							style={{
								fontSize: TYPE.body * 1.2, // ちょっと大きめ
								fontFamily: FONT.sans,
								fontWeight: 400, // ボールドを排除
								color: '#6e5b4d', // モカブラウン
								marginTop: 36,
								opacity: interpolate(
									frame,
									[dropEndFrame + 60, dropEndFrame + 80],
									[0, 1],
									{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
								),
								letterSpacing: '0.05em',
								textTransform: 'uppercase' as const,
								textShadow: 'none'
							}}
						>
							「GUIDE」とコメント欄に入力
						</p>
					)}
				</div>
			)}

			{/* ═══ UI ELEMENTS ═══ */}

			{/* Progress Bar (gradient: Sage → Gold) */}
			<div
				style={{
					position: 'absolute',
					left: LAYOUT.progressMarginX,
					right: LAYOUT.progressMarginX + LAYOUT.safeRight,
					top: LAYOUT.progressY,
					height: LAYOUT.progressHeight,
					backgroundColor: `${COLOR.muted}22`,
					borderRadius: LAYOUT.progressHeight / 2,
					zIndex: 30,
					overflow: 'hidden',
				}}
			>
				<div
					style={{
						height: '100%',
						width: `${progressWidth}%`,
						background: `linear-gradient(90deg, #a6998f, #6e5b4d)`,
						borderRadius: LAYOUT.progressHeight / 2,
						boxShadow: `none`,
					}}
				/>
			</div>

			{/* ═══ DEVELOPMENT GUIDES (remove for production) ═══ */}
			{/* Upper 1/3 line — Rule of Thirds */}
			<div
				style={{
					position: 'absolute',
					top: LAYOUT.thirdLineTop,
					left: 0,
					right: 0,
					height: 1,
					borderTop: `1px dashed ${COLOR.gold}30`,
					zIndex: 50,
					pointerEvents: 'none',
				}}
			/>
			{/* Top safe zone */}
			<div
				style={{
					position: 'absolute',
					top: LAYOUT.safeTop,
					left: 0,
					right: 0,
					height: 1,
					borderTop: `1px dashed ${COLOR.muted}30`,
					zIndex: 50,
					pointerEvents: 'none',
				}}
			/>
			{/* Bottom safe zone (30%) */}
			<div
				style={{
					position: 'absolute',
					bottom: LAYOUT.safeBottom,
					left: 0,
					right: 0,
					height: 1,
					borderTop: `1px dashed ${COLOR.muted}30`,
					zIndex: 50,
					pointerEvents: 'none',
				}}
			/>
			{/* Right safe zone (20%) */}
			<div
				style={{
					position: 'absolute',
					top: 0,
					right: LAYOUT.safeRight,
					width: 1,
					height: '100%',
					borderLeft: `1px dashed ${COLOR.muted}30`,
					zIndex: 50,
					pointerEvents: 'none',
				}}
			/>

			{/* ═══ AUDIO LAYERS ═══ */}

			{/* Voiceover (ElevenLabs) — サムネイル終了後から最後まで通しで再生 */}
			{voiceoverUrl && (
				<Sequence from={THUMBNAIL_DURATION}>
					<Audio
						src={staticFile(voiceoverUrl.replace(/^\//, ''))}
						volume={1.0}
					/>
				</Sequence>
			)}

			{/* BGM with Ducking — サムネイル後から開始 */}
			{bgmUrl && (
				<Sequence from={THUMBNAIL_DURATION}>
					<Audio
						src={staticFile(bgmUrl.replace(/^\//, ''))}
						volume={(f) => {
							// f is relative to Sequence start (0 = when BGM starts)
							const absFrame = f + THUMBNAIL_DURATION;
							// Smooth fade during heartbeat dip（クリップノイズ防止）
							if (absFrame >= dropFrame - 5 && absFrame <= dropEndFrame + 5) {
								return interpolate(
									absFrame,
									[dropFrame - 5, dropFrame, dropEndFrame, dropEndFrame + 5],
									[0.15, 0.02, 0.02, 0.15],
									{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
								);
							}
							// Ducking: lower BGM when voiceover is active
							if (voiceoverUrl) {
								return interpolate(
									f,
									[0, 5, durationInFrames - THUMBNAIL_DURATION - 90, durationInFrames - THUMBNAIL_DURATION],
									[0, 0.15, 0.15, 0],
									{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
								);
							}
							// No voiceover: full BGM with fade in/out
							return interpolate(
								f,
								[0, 30, durationInFrames - THUMBNAIL_DURATION - 60, durationInFrames - THUMBNAIL_DURATION],
								[0, 0.5, 0.5, 0],
								{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
							);
						}}
						loop
					/>
				</Sequence>
			)}
		</AbsoluteFill>
	);
};
