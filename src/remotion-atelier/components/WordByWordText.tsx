import { useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from 'remotion';
import React from 'react';
import type { ScriptWord } from '../schema';
// ※COLORやFONTは既存のdesign-systemを維持しつつ、コンポーネント内で直接Skin Atelierのカラーで上書きします
import { TYPE, FONT, LAYOUT, COLOR, CANVAS, EASING } from '../design-system';

/**
 * Skin Atelier Exclusive: Word-by-Word Typography Component
 * 
 * ATELIER SPECIFIC CHANGES:
 * - Glassmorphism: White frosted glass background (blur-16px) for luxurious yet readable base.
 * - Typography: Functional Modern Gothic (Noto Sans JP) with weight 300/500, no drop shadows.
 * - Spacing: "leading-relaxed" (lineHeight 1.7) block text tracking normal.
 * - Quiet Highlight: Emphasis uses Mocha Brown (#6e5b4d) and 1px elegant underline.
 * - Animation: Removed bounce. Soft, slow fade-up using dampened spring.
 */
export const WordByWordText: React.FC<{ 
	words: ScriptWord[];
	offsetY?: number;
	scale?: number;
	globalOpacity?: number;
	frameOffset?: number;
}> = ({ words, offsetY = 0, scale = 1, globalOpacity = 1, frameOffset = 0 }) => {
	const relativeFrame = useCurrentFrame();
	const frame = relativeFrame + frameOffset;
	const { fps } = useVideoConfig();

	// ── 単語の結合処理（既存ロジック維持） ──
	const mergedWords: ScriptWord[] = [];
	words.forEach((word) => {
		const lowerText = word.text.toLowerCase().replace(/[^a-z]/g, '');
		if ((lowerText === 'percent' || lowerText === 'mg' || lowerText === 'milligrams' || lowerText === 'milligram') && mergedWords.length > 0) {
			const prevWord = mergedWords[mergedWords.length - 1];
			if (/\d/.test(prevWord.text)) {
				prevWord.text += (lowerText === 'percent' ? '%' : 'mg');
				prevWord.endFrame = word.endFrame;
				return;
			}
		}
		mergedWords.push({ ...word });
	});

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
				height: CANVAS.height - LAYOUT.safeBottom - 40, // 少し下に配置
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'flex-end', // 中央ではなく下部固定の安定感
				alignItems: 'center',
				textAlign: 'center' as const,
				opacity: globalOpacity,
				transform: `translateY(${offsetY}px) scale(${scale})`,
				zIndex: 20,
				transformOrigin: 'center bottom',
				paddingBottom: '160px', // CTAやプログレスバーと被らない余白
			}}
		>
			{groups.map((group, groupIndex) => {
				if (groupIndex !== activeGroupIndex) return null;

				const groupStart = group[0].startFrame;
				const groupRelativeStart = Math.max(0, groupStart - frameOffset);

				// 洗練されたシームレスなフェード（15フレーム / 0.5秒）
				const groupOpacity = interpolate(
					relativeFrame,
					[groupRelativeStart, groupRelativeStart + 15], 
					[0, 1],
					{
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.out(Easing.ease),
					}
				);

				// ゆっくり上にスライドアップするSpring（バウンスを排除）
				const slideUp = spring({
					frame: Math.max(0, relativeFrame - groupRelativeStart),
					fps,
					config: {
						damping: 24, // 高いDampingでバウンス（跳ね）を削除
						stiffness: 120, // 柔らかい動き
						mass: 1,
					},
				});

				const translateY = interpolate(slideUp, [0, 1], [30, 0]);

				return (
					<div
						key={groupIndex}
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							opacity: groupOpacity,
							transform: `translateY(${translateY}px)`,
						}}
					>
						{/* 🧊 Skin Atelier: Glassmorphism Panel */}
						<div
							style={{
								display: 'flex',
								flexWrap: 'wrap',
								justifyContent: 'flex-start',
								alignItems: 'baseline',
								gap: '0px',
								maxWidth: LAYOUT.textMaxWidth * 1.05,
								backgroundColor: 'rgba(252, 249, 248, 0.6)', // 温かみのある白の半透明
								backdropFilter: 'blur(16px)', // すりガラス効果
								WebkitBackdropFilter: 'blur(16px)',
								padding: '24px 36px',
								borderRadius: 24,
								border: '1px solid rgba(255, 255, 255, 0.4)', // 光の反射のエッジ
								boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0,0,0,0.02)', // 非常に柔らかい影
							}}
						>
							{group.map((word, wordIndex) => {
								const isVisible = frame >= word.startFrame;
								if (!isVisible) return null;

								const wordRelativeStart = Math.max(0, word.startFrame - frameOffset);
								const effectiveFrame = Math.max(0, relativeFrame - wordRelativeStart);

								// 個々の単語も柔らかくフェードイン
								const opacity = interpolate(
									effectiveFrame,
									[0, 8],
									[0, 1],
									{
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
										easing: Easing.out(Easing.ease),
									}
								);

								const isEmphasized = word.isEmphasized;
								const displayWord = word.text;

								return (
									<span
										key={wordIndex}
										style={{
											display: 'inline-block',
											opacity,
											fontSize: TYPE.body * 1.3,
											fontFamily: FONT.sans, // Noto Sans JP等のゴシックを指定
											fontWeight: isEmphasized ? 500 : 300, // 威圧感のないウエイト（ルール1）
											color: isEmphasized ? '#6e5b4d' : '#5f5e5e', // モカブラウン vs ダークグレー（ルール5）
											letterSpacing: '0.05em', // 和文標準
											lineHeight: 1.7, // 抜け感を作る広い行間（ルール2）
											textShadow: 'none', // ノイズ排除（ルール4）
											
											// 静かなハイライト（極細1pxアンダーライン）
											...(isEmphasized ? {
												textDecoration: 'none',
												borderBottom: '1px solid #6e5b4d',
												paddingBottom: '2px', // ボーダーと文字の隙間
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
