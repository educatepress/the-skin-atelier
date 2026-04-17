"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var genai_1 = require("@google/genai");
var web_api_1 = require("@slack/web-api");
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var dotenv_1 = __importDefault(require("dotenv"));
var sheets_db_1 = require("../lib/sheets-db");
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), ".env.local") });
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), ".env") }); // Also load .env for Slack token
var apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("❌ エラー: GEMINI_API_KEY が設定されていません。");
    process.exit(1);
}
var SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
var TARGET_CHANNEL = 'skin-atelier_jp'; // XとBlogはskin-atelier_jpへ
var ai = new genai_1.GoogleGenAI({ apiKey: apiKey });
var slackClient = new web_api_1.WebClient(SLACK_BOT_TOKEN);
/**
 * Helper: リトライ付きAPI呼び出し (503対策)
 */
function withRetry(fn_1) {
    return __awaiter(this, arguments, void 0, function (fn, maxRetries, baseDelay) {
        var _loop_1, attempt, state_1;
        if (maxRetries === void 0) { maxRetries = 10; }
        if (baseDelay === void 0) { baseDelay = 15000; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _loop_1 = function (attempt) {
                        var _b, err_1, delay_1;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _c.trys.push([0, 2, , 4]);
                                    _b = {};
                                    return [4 /*yield*/, fn()];
                                case 1: return [2 /*return*/, (_b.value = _c.sent(), _b)];
                                case 2:
                                    err_1 = _c.sent();
                                    if (attempt === maxRetries || (err_1 === null || err_1 === void 0 ? void 0 : err_1.status) !== 503)
                                        throw err_1;
                                    delay_1 = baseDelay * Math.pow(2, attempt - 1);
                                    console.log("\u23F3 API\u6DF7\u96D1\u4E2D (503)\u2026 ".concat(delay_1 / 1000, "\u79D2\u5F8C\u306B\u30EA\u30C8\u30E9\u30A4 (").concat(attempt, "/").concat(maxRetries, ")"));
                                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, delay_1); })];
                                case 3:
                                    _c.sent();
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    };
                    attempt = 1;
                    _a.label = 1;
                case 1:
                    if (!(attempt <= maxRetries)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1(attempt)];
                case 2:
                    state_1 = _a.sent();
                    if (typeof state_1 === "object")
                        return [2 /*return*/, state_1.value];
                    _a.label = 3;
                case 3:
                    attempt++;
                    return [3 /*break*/, 1];
                case 4: throw new Error("Unreachable");
            }
        });
    });
}
/**
 * X (Twitter) 用の投稿文を生成する（3〜5ポストのスレッド形式）
 */
function generateXPost(theme, sceneContext) {
    return __awaiter(this, void 0, void 0, function () {
        var promptPath, masterPrompt, prompt, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\u270D\uFE0F \u62E1\u6563\u30B9\u30EC\u30C3\u30C9\uFF08X/Twitter\uFF09\u3092\u751F\u6210\u4E2D...");
                    promptPath = path_1.default.join(process.cwd(), "..", "the-skin-atelier", "prompts", "multi-platform-content-prompts.md");
                    masterPrompt = "";
                    try {
                        masterPrompt = fs_1.default.readFileSync(promptPath, "utf-8");
                    }
                    catch (e) {
                        console.error("Could not read prompt MD", e);
                    }
                    prompt = "\n    \u4EE5\u4E0B\u306E\u30EB\u30FC\u30EB\u306B\u5F93\u3044X\u306E\u30B9\u30EC\u30C3\u30C9\uFF083\u301C5\u30DD\u30B9\u30C8\uFF09\u3092\u4F5C\u6210\u3057\u3066\u304F\u3060\u3055\u3044\u3002\n    \u7279\u306BMarkdown\u306E\u30102. \u3010X (Twitter) / Threads \u7528\u3011\u3011\u306E\u6307\u793A\u3092\u7D76\u5BFE\u306B\u5B88\u308B\u3053\u3068\u3002\n\n    \u3010\u30EB\u30FC\u30EB\u5143\u30D5\u30A1\u30A4\u30EB\u629C\u7C8B\u3011:\n    ".concat(masterPrompt, "\n\n    \u3010\u4ECA\u56DE\u306E\u30A4\u30F3\u30D7\u30C3\u30C8\u3011\n    \u30FB\u30C6\u30FC\u30DE\uFF1A").concat(theme, "\n    \u30FB\u4ECA\u65E5\u306E\u304D\u3063\u304B\u3051\uFF08Scene\uFF09\uFF1A").concat(sceneContext || '本日の診察での気づき', "\n\n    \u203B\u4F59\u8A08\u306A\u30DE\u30FC\u30AF\u30C0\u30A6\u30F3\uFF08```\u306A\u3069\uFF09\u3092\u4F7F\u308F\u305A\u3001\u305D\u306E\u307E\u307E\u30B3\u30D4\u30DA\u3057\u3066\u4F7F\u3048\u308B\u30D7\u30EC\u30FC\u30F3\u30C6\u30AD\u30B9\u30C8\u3092\u51FA\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002\u30B9\u30EC\u30C3\u30C9\u306E\u533A\u5207\u308A\u306F\u300C---\u300D\u3068\u3057\u3066\u304F\u3060\u3055\u3044\u3002\n  ");
                    return [4 /*yield*/, withRetry(function () { return ai.models.generateContent({
                            model: "gemini-2.5-flash",
                            contents: prompt,
                        }); })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.text];
            }
        });
    });
}
/**
 * Slackへ承認ブロックを送信する
 */
function sendSlackApprovalMessage(contentId, slug, captionText) {
    return __awaiter(this, void 0, void 0, function () {
        var blocks, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\uD83D\uDCE4 Slack \u3078\u627F\u8A8D\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u9001\u4FE1\u4E2D...");
                    blocks = [
                        {
                            type: 'section',
                            text: {
                                type: 'mrkdwn',
                                text: "\uD83D\uDC26 *X (Twitter) \u6295\u7A3F*: `".concat(slug, "`\n\u3010\u914D\u4FE1\u5148: \uD83D\uDFE6 hiroo-open / Dr. Miyaka\u3011")
                            }
                        },
                        {
                            type: 'section',
                            text: {
                                type: 'mrkdwn',
                                text: "\uD83D\uDCDD *\u6295\u7A3F\u5185\u5BB9 (\u30B9\u30EC\u30C3\u30C9):*\n> ".concat(captionText.replace(/\n/g, '\n> '))
                            }
                        },
                        {
                            type: 'actions',
                            elements: [
                                {
                                    type: 'button',
                                    text: { type: 'plain_text', text: '✅ 承認', emoji: true },
                                    style: 'primary',
                                    action_id: 'approve_content',
                                    value: JSON.stringify({ id: contentId, batchId: 'auto-x', brand: 'atelier' }),
                                },
                                {
                                    type: 'button',
                                    text: { type: 'plain_text', text: '❌ 却下', emoji: true },
                                    style: 'danger',
                                    action_id: 'reject_content',
                                    value: JSON.stringify({ id: contentId, brand: 'atelier' }),
                                },
                            ]
                        },
                        {
                            type: 'actions',
                            elements: [
                                {
                                    type: 'button',
                                    text: { type: 'plain_text', text: '✨ この案で手動ポスト/編集する (Xアプリ起動)', emoji: true },
                                    style: 'primary',
                                    url: (function () {
                                        var encoded = encodeURIComponent(captionText);
                                        if (encoded.length > 2900) {
                                            var trimmed = captionText;
                                            while (encodeURIComponent(trimmed).length > 2900) {
                                                trimmed = trimmed.slice(0, -10);
                                            }
                                            encoded = encodeURIComponent(trimmed);
                                        }
                                        return "https://x.com/intent/tweet?text=".concat(encoded);
                                    })(),
                                    action_id: "intent_tweet_".concat(contentId)
                                }
                            ]
                        },
                        { type: 'divider' },
                    ];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, slackClient.chat.postMessage({
                            channel: TARGET_CHANNEL,
                            text: "\uD83D\uDC26 X\u6295\u7A3F ".concat(slug, " \u2014 \u30EC\u30D3\u30E5\u30FC\u5F85\u3061"),
                            blocks: blocks,
                        })];
                case 2:
                    result = _a.sent();
                    console.log("\u2705 Slack\u901A\u77E5\u5B8C\u4E86: ".concat(result.ts));
                    return [2 /*return*/, result.ts];
                case 3:
                    error_1 = _a.sent();
                    console.error("\u274C Slack\u901A\u77E5\u30A8\u30E9\u30FC:", error_1);
                    return [2 /*return*/, undefined];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * メイン実行関数
 */
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var targetDate, tomorrowStr, args, theme, sceneContext, slug, contentId, generatedText, cleanText, slackTs, newRow, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    targetDate = new Date();
                    targetDate.setDate(targetDate.getDate() + 1);
                    tomorrowStr = targetDate.toISOString().split('T')[0];
                    args = process.argv.slice(2);
                    theme = args[0] || "春のゆらぎ肌と花粉によるスキンケア";
                    sceneContext = args[1] || "最新の医学論文や自身のスキンケア経験から得られた客観的な気づき。架空の患者は絶対に出さないこと。";
                    slug = "x-".concat(tomorrowStr, "-").concat(Math.random().toString(36).substring(7));
                    contentId = "x-".concat(tomorrowStr, "-").concat(slug);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, generateXPost(theme, sceneContext)];
                case 2:
                    generatedText = _a.sent();
                    cleanText = (generatedText === null || generatedText === void 0 ? void 0 : generatedText.replace(/^```\n/gm, "").replace(/```$/gm, "").trim()) || "";
                    console.log("\n==============================");
                    console.log(cleanText);
                    console.log("==============================\n");
                    return [4 /*yield*/, sendSlackApprovalMessage(contentId, slug, cleanText)];
                case 3:
                    slackTs = _a.sent();
                    newRow = {
                        content_id: contentId,
                        brand: 'atelier',
                        type: 'x',
                        title: slug,
                        generation_recipe: JSON.stringify({
                            captionText: cleanText,
                            theme: theme,
                            sceneContext: sceneContext
                        }),
                        status: 'pending',
                        slack_ts: slackTs || '',
                    };
                    console.log("\uD83D\uDCE6 Google Sheets \u306B\u30AD\u30E5\u30FC\u3092\u767B\u9332\u4E2D...");
                    return [4 /*yield*/, sheets_db_1.SheetsDB.appendRows([newRow])];
                case 4:
                    _a.sent();
                    console.log("\uD83C\uDF89 \u30AD\u30E5\u30FC\u767B\u9332\u5B8C\u4E86\uFF01Slack\u3067\u78BA\u8A8D\u30FB\u627F\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
                    return [3 /*break*/, 6];
                case 5:
                    error_2 = _a.sent();
                    console.error("❌ エラーが発生しました:", error_2);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
main();
