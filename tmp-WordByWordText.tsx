import { useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from 'remotion';
import React from 'react';
import type { ScriptWord } from '../schema';
import { TYPE, FONT, LAYOUT, COLOR, CANVAS, EASING } from '../design-system';

/**
 * Premium Word-by-Word Typography Component v5
 * 
 * v5 CHANGES:
 * - Frosted glass pill background behind each phrase group for better readability
 * - Enhanced emphasis word styling with gradient underline
 * - Refined text shadows for cinematic depth
 * - Tighter letter tracking for premium feel
 */
export const WordByWordText: React.FC<{ 
	words: ScriptWord[];
	offsetY?: number;
	scale?: number;
	globalOpacity?: number;
	/**
	 * このコンポーネントが Sequence 内に配置されている場合、
	 * Sequence の startFrame を渡すことで内部の相対フレームを
	 * synced-data.json の絶対フレームに変換できます。
	 * 例: <Sequence from={45}> の中なら frameOffset={45}
	 */
	frameOffset?: number;
}> = ({ words, offsetY = 0, scale = 1, globalOpacity = 1, frameOffset = 0 }) => {
	// Sequence内では useCurrentFrame() は 0 始まりの相対フレームを返す。
	// synced-data.json は音声全体を基準にした絶対フレームのため、
	// frameOffset を足して絶対フレームに変換する。
	const relativeFrame = useCurrentFrame();
	const frame = relativeFrame + frameOffset;
	const { fps } = useVideoConfig();

	// ── 数字と単位(percent/mg)を結合する前処理 ──
	// Whisperが「48」と「percent」を別ワードに分割するのを「48%」としてピタッとくっつける
	const mergedWords: ScriptWord[] = [];
	words.forEach((word) => {
		const lowerText = word.text.toLowerCase().replace(/[^a-z]/g, '');
		if ((lowerText === 'percent' || lowerText === 'mg' || lowerText === 'milligrams' || lowerText === 'milligram') && mergedWords.length > 0) {
			const prevWord = mergedWords[mergedWords.length - 1];
			if (/\d/.test(prevWord.text)) {
				prevWord.text += (lowerText === 'percent' ? '%' : 'mg');
				prevWord.endFrame = word.endFrame;
				return; // 単独の percent/mg は破棄
			}
		}
		mergedWords.push({ ...word });
	});

	// 結合済みデータをグループ化
	const groups: ScriptWord[][] = [];
	let currentGroup: ScriptWord[] = [];

	mergedWords.forEach((word, i) => {
		if (i === 0) {
			currentGroup.push(word);
			return;
		}
		const gap = word.startFrame - mergedWords[i - 1].startFrame;
		if (gap > 20) {
			groups.push(currentGroup);
			currentGroup = [word];
		} else {
			currentGroup.push(word);
		}
	});
	if (currentGroup.length > 0) groups.push(currentGroup);


	// アクティブなグループインデックスの取得（絶対フレームベース）
	const activeGroupIndex = groups.findIndex((group, idx) => {
		const groupStart = group[0].startFrame;
		const nextGroupStart = idx < groups.length - 1 ? groups[idx + 1][0].startFrame : Infinity;
		return frame >= groupStart && frame < nextGroupStart;
	});

	return (
		<div
			style={{
				position: 'absolute',
				top: 0,
				left: LAYOUT.marginX,
				right: LAYOUT.marginX + LAYOUT.safeRight,
				height: CANVAS.height - LAYOUT.safeBottom,
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				textAlign: 'center' as const,
				opacity: globalOpacity,
				transform: `translateY(${offsetY}px) scale(${scale})`,
				zIndex: 20,
				transformOrigin: 'center center',
			}}
		>
			{groups.map((group, groupIndex) => {
				if (groupIndex !== activeGroupIndex) return null;

				const groupStart = group[0].startFrame; // 絶対フレーム
				// relativeFrame ベースでアニメーション計算
				// groupStart < frameOffset のケース（音声先頭がSequence開始前）では
				// 負の値になるため Math.max(0) でガードする
				const groupRelativeStart = Math.max(0, groupStart - frameOffset);

				// フェードイン（3フレームでキビキビ表示 ≈ 100ms）
				const groupOpacity = interpolate(
					relativeFrame,
					[groupRelativeStart, groupRelativeStart + 3], 
					[0, 1],
					{
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.bezier(...EASING.materialStandard),
					}
				);

				const groupScale = spring({
					frame: Math.max(0, relativeFrame - groupRelativeStart),
					fps,
					config: {
						damping: 16,
						stiffness: 180,
						mass: 0.5,
					},
				});

				return (
					<div
						key={groupIndex}
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							opacity: groupOpacity,
							transform: `scale(${groupScale})`,
						}}
					>
						{/* ⭐️ v5: Frosted Glass Pill — 読みやすさとプレミアム感を両立 */}
						<div
							style={{
								display: 'flex',
								flexWrap: 'wrap',
								justifyContent: 'center',
								alignItems: 'baseline',
								gap: '8px 14px',
								maxWidth: LAYOUT.textMaxWidth,
								// Safely darkened background (Removed backdropFilter to avoid Chromium compositor bugs blurring the text)
								backgroundColor: 'rgba(0, 0, 0, 0.65)',
								padding: '16px 28px',
								borderRadius: 20,
								border: '1px solid rgba(255, 255, 255, 0.08)',
								boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
							}}
						>
							{group.map((word, wordIndex) => {
								// 絶対フレームとの比較で表示判定
								const isVisible = frame >= word.startFrame;
								if (!isVisible) return null;

								// アニメーションは relativeFrame ベースで計算（負値ガード）
								const wordRelativeStart = Math.max(0, word.startFrame - frameOffset);
								const effectiveFrame = Math.max(0, relativeFrame - wordRelativeStart);

								const opacity = interpolate(
									effectiveFrame,
									[0, 4],
									[0, 1],
									{
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
										easing: Easing.bezier(...EASING.materialStandard),
									}
								);

								const isEmphasized = word.isEmphasized;
								
								// 前処理で結合済みのため、そのまま表示
								const displayWord = word.text;
								
								// v5: より深みのあるテキストシャドウ
								const textShadow = isEmphasized
									? `0 2px 16px rgba(217, 136, 113, 0.6), 0 1px 4px rgba(0,0,0,0.3)`
									: '0 2px 12px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.2)';

								return (
									<span
										key={wordIndex}
										style={{
											display: 'inline-block',
											opacity,
											fontSize: isEmphasized ? TYPE.headline * 1.05 : TYPE.body * 1.35,
											fontFamily: FONT.sans,
											fontWeight: isEmphasized ? 900 : 700,
											color: isEmphasized ? COLOR.warn : '#FFFFFF',
											letterSpacing: '-0.025em',
											lineHeight: 1.35,
											textShadow,
											// v5: 強調ワードのスタイルを洗練
											...(isEmphasized ? {
												textDecoration: 'none',
												borderBottom: `3px solid ${COLOR.warn}`,
												paddingBottom: '2px',
											} : {}),
										}}
									>
										{displayWord}
									</span>
								);
							})}
						</div>
					</div>
				);
			})}
		</div>
	);
};
