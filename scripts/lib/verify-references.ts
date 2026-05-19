/**
 * Agent 3: 文献ハルシネーション検証エージェント
 *
 * 生成されたブログ記事から PMID を抽出し、PubMed API で実在確認 + メタデータ照合を行う。
 * Agent 2（Gemini）が Agent 1 の論文情報を正しくコピーしたかを独立検証する。
 */

import { fetchPubMedSummary, fetchPubMedAbstracts, type VerifiedReference } from './pubmed-research';

export interface ReferenceCheck {
    pmid: string;
    citedAuthor: string;   // 記事内に記載された著者名
    citedJournal: string;  // 記事内に記載された雑誌名
    citedYear: string;     // 記事内に記載された年
    exists: boolean;
    authorMatch: boolean;
    journalMatch: boolean;
    yearMatch: boolean;
    abstractRelevance: boolean; // 記事の主張がアブストラクトと整合するか
    abstractWarning?: string;   // 不整合の詳細
}

export interface VerificationResult {
    passed: boolean;
    checkedCount: number;
    details: ReferenceCheck[];
    failures: string[];
}

// ── MDX から PMID を抽出 ──
function extractPmidsFromMdx(mdx: string): string[] {
    const pmids: string[] = [];
    // PMID: 32767206 or PMID:32767206 or pubmed.ncbi.nlm.nih.gov/32767206
    const patterns = [
        /PMID:?\s*(\d{5,8})/gi,
        /pubmed\.ncbi\.nlm\.nih\.gov\/(\d{5,8})/g,
    ];
    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(mdx)) !== null) {
            if (!pmids.includes(match[1])) {
                pmids.push(match[1]);
            }
        }
    }
    return pmids;
}

// ── References セクションから引用情報を抽出 ──
function extractCitationDetails(mdx: string): Map<string, { author: string; journal: string; year: string }> {
    const details = new Map<string, { author: string; journal: string; year: string }>();

    // References セクションを抽出
    const refMatch = mdx.match(/#{1,4}\s*(?:参考|References)[^\n]*\n([\s\S]*?)(?=#{1,4}\s|$)/i);
    if (!refMatch) return details;
    const refSection = refMatch[1];

    // 各行から著者・雑誌・年・PMID を抽出
    const lines = refSection.split('\n').filter(l => l.trim().length > 0);
    for (const line of lines) {
        const pmidMatch = line.match(/PMID:?\s*(\d{5,8})/i) || line.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d{5,8})/);
        if (!pmidMatch) continue;
        const pmid = pmidMatch[1];

        // 著者: "AuthorName P," or "AuthorName P, et al." — 行頭のリストマーカーを除去してから取得
        const cleanLine = line.replace(/^\s*[\*\-]\s*/, '').replace(/^\d+\.\s*/, '');
        const authorMatch = cleanLine.match(/^([A-Za-z\u00C0-\u024F]+(?:\s[A-Z][A-Za-z]*)?)[\s,]/);
        const author = authorMatch ? authorMatch[1].trim() : '';

        // 雑誌: イタリック *Journal* or PMID/年の直前の "Journal. Year" パターン
        const journalMatch = line.match(/\*([^*]+)\*/) ||
            line.match(/\.\s+([A-Z][A-Za-z\s&]+)\.\s*(?:19|20)\d{2}/) ||  // Journal. Year
            line.match(/\.\s+([A-Z][A-Za-z\s&]+)\.\s*\[?PMID/i);         // Journal. PMID
        const journal = journalMatch ? journalMatch[1].trim() : '';

        // 年: 4桁数字（PMID以外）
        const yearCandidates = line.match(/\b(19|20)\d{2}\b/g) || [];
        // PMID自体を除外（7-8桁なので4桁年とは区別される。ただし念のため）
        const year = yearCandidates.find(y => !line.includes(`PMID: ${y}`) && !line.includes(`PMID:${y}`)) || '';

        details.set(pmid, { author, journal, year });
    }

    return details;
}

// ── 著者名の姓を正規化して比較 ──
function normalizeAuthorSurname(name: string): string {
    // "Florou P" → "florou", "Kim S" → "kim", "李 M" → "李"
    const parts = name.split(/[\s,]+/).filter(p => p.length > 0);
    // 姓は最も長いパート（イニシャルを避ける）
    const surname = parts.reduce((a, b) => a.length >= b.length ? a : b, parts[0] || '');
    return surname.toLowerCase().replace(/[^a-z\u00C0-\u024F\u3000-\u9FFF\uAC00-\uD7AF]/g, '');
}

// ── 雑誌名の正規化（略称揺れを吸収）──
function normalizeJournal(name: string): string {
    return name.toLowerCase()
        .replace(/[.\-_*]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// ── アブストラクト照合: 記事の主張がアブストラクトの内容と整合するか検証 ──
function extractClaimsForPmid(mdx: string, pmid: string, authorSurname: string): string[] {
    // 記事本文から、このPMIDや著者名が参照されている前後の文を抽出
    const claims: string[] = [];
    const bodyWithoutRefs = mdx.replace(/#{1,4}\s*(?:参考文献?|References)[\s\S]*$/i, '');
    const sentences = bodyWithoutRefs.split(/[。\.\n]+/).filter(s => s.trim().length > 10);

    for (const sentence of sentences) {
        const mentionsPmid = sentence.includes(pmid);
        const mentionsAuthor = authorSurname && sentence.toLowerCase().includes(authorSurname.toLowerCase());
        if (mentionsPmid || mentionsAuthor) {
            claims.push(sentence.trim());
        }
    }
    return claims;
}

function checkAbstractRelevance(
    claims: string[],
    abstractText: string,
): { relevant: boolean; warning?: string } {
    if (!abstractText || claims.length === 0) {
        // アブストラクトがない or 記事内に明示的引用がない場合はスキップ（合格扱い）
        return { relevant: true };
    }

    const absLower = abstractText.toLowerCase();

    // アブストラクトからキーワードを抽出（3文字以上の英単語 + 重要な医学用語）
    const absWords = new Set(
        absLower.match(/[a-z]{4,}/g)?.filter(w =>
            // ストップワードを除外
            !['with', 'from', 'that', 'this', 'were', 'been', 'have', 'their', 'which',
              'would', 'could', 'should', 'about', 'there', 'these', 'those', 'than',
              'more', 'also', 'into', 'only', 'other', 'some', 'such', 'when', 'what',
              'will', 'each', 'make', 'like', 'over', 'after', 'before', 'between',
              'through', 'during', 'without', 'again', 'further', 'then', 'once',
              'here', 'both', 'most', 'very', 'just', 'being', 'does', 'done',
              'study', 'studies', 'results', 'conclusion', 'background', 'methods',
              'objective', 'purpose', 'patients', 'subjects', 'compared', 'group',
              'significantly', 'associated', 'showed', 'found', 'reported',
            ].includes(w)
        ) || []
    );

    // 記事の主張文からキーワードを抽出し、アブストラクトとの重複を計測
    const mismatched: string[] = [];
    for (const claim of claims) {
        const claimWords = new Set(
            claim.toLowerCase().match(/[a-z]{4,}/g)?.filter(w => absWords.size > 0) || []
        );
        // 記事の主張に含まれる英語キーワードがアブストラクトに存在するか
        const claimKeywords = claim.toLowerCase().match(/[a-z]{4,}/g) || [];
        const relevantKeywords = claimKeywords.filter(w => absWords.has(w));

        // 英語キーワードが3つ以上あるのに、アブストラクトとの重複が0の場合は警告
        if (claimKeywords.length >= 3 && relevantKeywords.length === 0) {
            mismatched.push(claim.slice(0, 80));
        }
    }

    if (mismatched.length > 0) {
        return {
            relevant: false,
            warning: `記事の主張がアブストラクトの内容と無関係の可能性: "${mismatched[0]}..."`,
        };
    }

    return { relevant: true };
}

// ── メイン検証関数 ──
export async function verifyBlogReferences(mdxContent: string): Promise<VerificationResult> {
    const pmids = extractPmidsFromMdx(mdxContent);

    if (pmids.length === 0) {
        return { passed: true, checkedCount: 0, details: [], failures: [] };
    }

    const citationDetails = extractCitationDetails(mdxContent);
    // esummary（メタデータ）と efetch（アブストラクト）を並列取得
    const [pubmedData, abstractMap] = await Promise.all([
        fetchPubMedSummary(pmids),
        fetchPubMedAbstracts(pmids),
    ]);
    const pubmedMap = new Map(pubmedData.map(r => [r.pmid, r]));

    const details: ReferenceCheck[] = [];
    const failures: string[] = [];

    for (const pmid of pmids) {
        const pubmed = pubmedMap.get(pmid);
        const cited = citationDetails.get(pmid) || { author: '', journal: '', year: '' };

        if (!pubmed) {
            details.push({
                pmid, citedAuthor: cited.author, citedJournal: cited.journal, citedYear: cited.year,
                exists: false, authorMatch: false, journalMatch: false, yearMatch: false,
                abstractRelevance: false, abstractWarning: 'PMIDが存在しないため検証不可',
            });
            failures.push(`PMID ${pmid}: PubMedに存在しない`);
            continue;
        }

        // 著者チェック（組織名の場合はキーワード部分一致で判定）
        let authorMatch = true;
        if (cited.author) {
            const citedNorm = normalizeAuthorSurname(cited.author);
            const pubmedNorm = normalizeAuthorSurname(pubmed.firstAuthor);
            // 組織名（AAD, FDA, WHO, Committee等）はキーワード一致で許容
            const orgKeywords = ['aad', 'fda', 'who', 'committee', 'practice', 'consensus', 'eadv', 'jaad'];
            const isOrgCitation = orgKeywords.some(k => cited.author.toLowerCase().includes(k));
            const isOrgPubmed = orgKeywords.some(k => pubmed.firstAuthor.toLowerCase().includes(k));
            if (isOrgCitation && isOrgPubmed) {
                authorMatch = true; // 両方が組織名なら一致とみなす
            } else {
                authorMatch = citedNorm === pubmedNorm;
            }
        }

        // 雑誌チェック
        // 雑誌名: ワード単位で2語以上一致 or 片方が他方を含む
        let journalMatch = true;
        if (cited.journal) {
            const citedWords = normalizeJournal(cited.journal).split(/\s+/).filter(w => w.length > 2);
            const pubmedWords = normalizeJournal(pubmed.journal).split(/\s+/).filter(w => w.length > 2);
            const overlap = citedWords.filter(w => pubmedWords.includes(w));
            journalMatch = overlap.length >= 2 ||
                normalizeJournal(cited.journal).includes(normalizeJournal(pubmed.journal)) ||
                normalizeJournal(pubmed.journal).includes(normalizeJournal(cited.journal));
        }

        // 年チェック（±1年許容）
        const citedYearNum = parseInt(cited.year, 10);
        const yearMatch = cited.year
            ? !isNaN(citedYearNum) && Math.abs(citedYearNum - pubmed.year) <= 1
            : true;

        // アブストラクト照合: 記事の主張がアブストラクトの内容と整合するか
        const abstractText = abstractMap.get(pmid) || '';
        const authorSurname = normalizeAuthorSurname(pubmed.firstAuthor);
        const claims = extractClaimsForPmid(mdxContent, pmid, pubmed.firstAuthor);
        const relevance = checkAbstractRelevance(claims, abstractText);

        details.push({
            pmid, citedAuthor: cited.author, citedJournal: cited.journal, citedYear: cited.year,
            exists: true, authorMatch, journalMatch, yearMatch,
            abstractRelevance: relevance.relevant, abstractWarning: relevance.warning,
        });

        if (!authorMatch) failures.push(`PMID ${pmid}: 著者不一致 (記事: ${cited.author}, PubMed: ${pubmed.firstAuthor})`);
        if (!journalMatch) failures.push(`PMID ${pmid}: 雑誌不一致 (記事: ${cited.journal}, PubMed: ${pubmed.journal})`);
        if (!yearMatch) failures.push(`PMID ${pmid}: 年不一致 (記事: ${cited.year}, PubMed: ${pubmed.year})`);
        if (!relevance.relevant) failures.push(`PMID ${pmid}: ${relevance.warning}`);
    }

    // ── 本文中の未検証組織引用チェック ──
    // References外の本文で「WHO（2023）」「AADは〜推奨」等と書かれていた場合、
    // その組織の論文がReferencesに含まれていなければ警告
    const bodyWithoutRefs = mdxContent.replace(/#{1,4}\s*(?:参考文献?|References)[\s\S]*$/i, '');
    const orgPatterns = [
        /\b(WHO|World Health Organization)\s*[\(（]\s*\d{4}/gi,
        /\b(AAD|American Academy of Dermatology)\s*[\(（]/gi,
        /\b(FDA|Food and Drug Administration)\s*[\(（]/gi,
        /\b(EADV|European Academy of Dermatology)\s*[\(（]/gi,
        /\b(JDA|日本皮膚科学会)\s*[\(（]/gi,
    ];
    for (const pattern of orgPatterns) {
        let match;
        while ((match = pattern.exec(bodyWithoutRefs)) !== null) {
            const orgName = match[1];
            // Referencesにこの組織の論文があるかチェック
            const orgLower = orgName.toLowerCase();
            const hasInRefs = pubmedData.some(r =>
                r.firstAuthor.toLowerCase().includes(orgLower) ||
                r.journal.toLowerCase().includes(orgLower) ||
                r.title.toLowerCase().includes(orgLower)
            );
            if (!hasInRefs) {
                failures.push(`本文中に "${orgName}" の引用があるが、Referencesに対応する論文がない（ハルシネーションの可能性）`);
                break; // 同じ組織は1回だけ報告
            }
        }
    }

    return {
        passed: failures.length === 0,
        checkedCount: pmids.length,
        details,
        failures,
    };
}

// ── References セクションを除去（フォールバック用）──
export function removeReferencesSection(mdx: string): string {
    // "### 参考" or "## References" などで始まるセクションを次の見出しまで除去
    return mdx.replace(/#{1,4}\s*(?:参考文献?|References)[^\n]*\n[\s\S]*?(?=\n#{1,4}\s|\n---|\s*$)/gi, '');
}
