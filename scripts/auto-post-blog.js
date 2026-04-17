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
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var dotenv_1 = __importDefault(require("dotenv"));
var sheets_db_1 = require("./lib/sheets-db");
var web_api_1 = require("@slack/web-api");
// .env.localから環境変数を読み込む
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), ".env.local") });
// APIキーの確認
var apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("エラー: GEMINI_API_KEY が .env.local に設定されていません。");
    process.exit(1);
}
// Geminiクライアントの初期化
var ai = new genai_1.GoogleGenAI({ apiKey: apiKey });
// Slack連携の初期化
var SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
var TARGET_CHANNEL = 'skin-atelier_jp';
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
 * 1. Deep Research（Google検索を活用した情報収集）
 * ※プロンプトは後日推敲予定のため、仮のシンプルな状態にしています。
 */
function performDeepResearch(theme) {
    return __awaiter(this, void 0, void 0, function () {
        var researchPrompt, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\uD83D\uDD0D \u30C6\u30FC\u30DE\u300C".concat(theme, "\u300D\u306B\u3064\u3044\u3066Deep Research\u3092\u5B9F\u884C\u4E2D..."));
                    researchPrompt = "\n    \u3042\u306A\u305F\u306F\u7F8E\u5BB9\u533B\u5B66\u306E\u30B7\u30CB\u30A2\u30FB\u30EA\u30B5\u30FC\u30C1\u30FB\u30A8\u30C7\u30A3\u30BF\u30FC\u3067\u3059\u3002\u4EE5\u4E0B\u306E\u30C6\u30FC\u30DE\u306B\u3064\u3044\u3066\u3001\u6700\u65B0\u306E\u533B\u5B66\u7684\u77E5\u898B\u3084\u30C8\u30EC\u30F3\u30C9\u3092Google\u691C\u7D22\u3092\u7528\u3044\u3066\u8ABF\u67FB\u3057\u3001\u8981\u70B9\u3092\u307E\u3068\u3081\u3066\u304F\u3060\u3055\u3044\u3002\n    \u3010\u91CD\u8981\u5236\u7D04\u30EB\u30FC\u30EB\u3011\n    - \u30DE\u30A6\u30B9\u30FB\u7D30\u80DE\u3092\u4F7F\u3063\u305F\u52D5\u7269\u5B9F\u9A13\u7B49\uFF08Tier C\uFF09\u306E\u30C7\u30FC\u30BF\u306F\u30A8\u30D3\u30C7\u30F3\u30B9\u3068\u3057\u3066\u4E0D\u5341\u5206\u306A\u305F\u3081\u9664\u5916\u3057\u3066\u304F\u3060\u3055\u3044\u3002\n    - \u30E1\u30BF\u30A2\u30CA\u30EA\u30B9\u3001\u7CFB\u7D71\u7684\u30EC\u30D3\u30E5\u30FC\u3001RCT\u3001\u5927\u898F\u6A21\u89B3\u5BDF\u7814\u7A76\u306A\u3069\u300C\u30D2\u30C8\u306B\u5BFE\u3059\u308B\u6709\u52B9\u6027\u304C\u78BA\u7ACB\u3055\u308C\u305F\u30C7\u30FC\u30BF\uFF08Tier A/B\uFF09\u300D\u306E\u307F\u3092\u53CE\u96C6\u3057\u3066\u304F\u3060\u3055\u3044\u3002\n    \u30C6\u30FC\u30DE: ".concat(theme, "\n  ");
                    return [4 /*yield*/, withRetry(function () { return ai.models.generateContent({
                            model: "gemini-2.5-flash",
                            contents: researchPrompt,
                            config: {
                                tools: [{ googleSearch: {} }],
                            }
                        }); })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.text];
            }
        });
    });
}
/**
 * 2. 記事用の画像自動取得 (ローカルのプールから選定)
 */
function fetchAestheticImage() {
    return __awaiter(this, void 0, void 0, function () {
        var poolDir, files;
        return __generator(this, function (_a) {
            try {
                poolDir = path_1.default.join(process.cwd(), "public", "images", "pool");
                if (fs_1.default.existsSync(poolDir)) {
                    files = fs_1.default.readdirSync(poolDir).filter(function (f) { return f.match(/\.(jpg|jpeg|png|webp)$/i); });
                    if (files.length > 0) {
                        return [2 /*return*/, "/images/pool/".concat(files[Math.floor(Math.random() * files.length)])];
                    }
                }
            }
            catch (e) {
                console.error("Pool search error:", e);
            }
            return [2 /*return*/, ""];
        });
    });
}
/**
 * 3. 記事の生成
 * ※プロンプトは後日推敲予定のため、ガイドラインの内容を簡易的に埋め込んでいます。
 */
function generateBlogPost(theme, researchData, imageUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var promptPath, masterPrompt, writingPrompt, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\u270D\uFE0F \u8A18\u4E8B\u3092\u751F\u6210\u4E2D\uFF08Elegant Letter Style\uFF09...");
                    promptPath = path_1.default.join(process.cwd(), "..", "the-skin-atelier", "prompts", "blog-writing-guide.md");
                    masterPrompt = "";
                    try {
                        masterPrompt = fs_1.default.readFileSync(promptPath, "utf-8");
                    }
                    catch (e) {
                        console.error("Could not read prompt MD", e);
                    }
                    writingPrompt = "\n    \u4EE5\u4E0B\u306E\u3010The Skin Atelier \u2014 \u30D6\u30ED\u30B0\u57F7\u7B46\u30AC\u30A4\u30C9\u30E9\u30A4\u30F3\uFF06\u30D7\u30ED\u30F3\u30D7\u30C8\u3011\u306B\u5B8C\u5168\u306B\u5F93\u3063\u3066\u3001\u30D6\u30ED\u30B0\u8A18\u4E8B\u3092\u4F5C\u6210\u3057\u3066\u304F\u3060\u3055\u3044\u3002\n    \u7279\u306B\u3010\u51FA\u529B\u30D5\u30A9\u30FC\u30DE\u30C3\u30C8\u3011\u306E\u69CB\u9020\u3092\u53B3\u5B88\u3059\u308B\u3053\u3068\u3002\n\n    \u3010\u30AC\u30A4\u30C9\u30E9\u30A4\u30F3\u5143\u30D5\u30A1\u30A4\u30EB\u629C\u7C8B\u3011:\n    ".concat(masterPrompt, "\n\n    \u3010\u30C6\u30FC\u30DE\u3011: ").concat(theme, "\n    \u3010\u30EA\u30B5\u30FC\u30C1\u30C7\u30FC\u30BF\u3011: ").concat(researchData, "\n    \n    ---\n    title: \"\u8A18\u4E8B\u306E\u30BF\u30A4\u30C8\u30EB\"\n    excerpt: \"100\u6587\u5B57\u7A0B\u5EA6\u306E\u6982\u8981\"\n    date: \"YYYY-MM-DD\"\n    category: \"Skincare\"\n    readTime: \"\u3007 min read\"\n    featured: false\n    image: \"").concat(imageUrl, "\"\n    ---\n    \n    ## \u3042\u306A\u305F\u3078\u3001\n    ## \u307E\u305A\u3001\u304A\u4F1D\u3048\u3057\u305F\u3044\u5927\u5207\u306A\u3053\u3068\n    ## \u7F8E\u3057\u3055\u3092\u7D10\u89E3\u304F\u3001\u5C02\u9580\u533B\u306E\u8996\u70B9\n    ## \u3042\u306A\u305F\u306E\u4E0D\u5B89\u306B\u5BC4\u308A\u6DFB\u3063\u3066\n    ## \u6700\u5F8C\u306B\u3001\u5FC3\u3092\u8FBC\u3081\u3066\u3002\n    ## \u53C2\u8003\u6587\u732E\n\n    ![Dr. Miyaka Signature](/images/miyaka-signature-trimmed.png)\n  ");
                    return [4 /*yield*/, ai.models.generateContent({
                            model: "gemini-2.5-flash",
                            contents: writingPrompt,
                        })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.text];
            }
        });
    });
}
/**
 * 3. 記事の自動検閲（レビュー＆修正）
 * 生成された記事を「医療広告ガイドライン」および「トーン」の観点から厳格に自己検閲し、修正する
 */
function reviewArticle(articleMdx) {
    return __awaiter(this, void 0, void 0, function () {
        var reviewPrompt, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\uD83E\uDDD0 \u751F\u6210\u3055\u308C\u305F\u8A18\u4E8B\u3092\u81EA\u52D5\u3067\u691C\u95B2\u30FB\u4FEE\u6B63\u4E2D...");
                    reviewPrompt = "\n    \u3042\u306A\u305F\u306F\u533B\u7642\u6CD5\u52D9\u90E8\u304A\u3088\u3073VOGUE\u306E\u7DE8\u96C6\u9577\u3067\u3059\u3002\n    \u4EE5\u4E0B\u306E\u3010\u30D6\u30ED\u30B0\u539F\u7A3F\u3011\u3092\u53B3\u683C\u306B\u691C\u95B2\u3057\u3001\u554F\u984C\u304C\u3042\u308C\u3070\u4FEE\u6B63\u3057\u3066\u304F\u3060\u3055\u3044\u3002\n\n    \u3010\u691C\u95B2\u57FA\u6E96\uFF1A\u30B7\u30EB\u30AF\u30C8\u30FC\u30F3\u30FB\u30D5\u30A3\u30EB\u30BF6\u7B87\u6761\u3011\n    1. \u904E\u5270\u306A\u30BB\u30FC\u30EB\u30B9\u306E\u6392\u9664\uFF08Trust First\uFF09: \u300C\u7D76\u5BFE\u6CBB\u308B\u300D\u300C\u6700\u9AD8\u300D\u300CNo.1\u300D\u306A\u3069\u306E\u8A87\u5927\u30FB\u65AD\u5B9A\u8868\u73FE\u304C\u306A\u3044\u304B\u3002\n    2. \u300C\u3042\u306A\u305F\u30FB\u79C1\u300D\u306E\u9EC4\u91D1\u6BD4\uFF08Empathy\uFF09: \u8AAC\u6559\u81ED\u304F\u306A\u3063\u3066\u3044\u306A\u3044\u304B\u3002\u89AA\u3057\u3044\u53CB\u4EBA\u306B\u5B9B\u3066\u305F\u624B\u7D19\u306E\u3088\u3046\u306A\u3001\u512A\u3057\u304F\u54C1\u306E\u3042\u308B\u65E5\u672C\u8A9E\uFF08\u4F59\u767D\u3092\u611F\u3058\u308B\u6587\u4F53\uFF09\u306B\u306A\u3063\u3066\u3044\u308B\u304B\u3002\n    3. \u5C02\u9580\u533B\u3068\u3057\u3066\u306E\u5BA2\u89B3\u7684\u30C8\u30FC\u30F3\uFF08Safety & Positivity\uFF09: \u300C\u9306\u3073\u3064\u3044\u3066\u3044\u308B\u300D\u300C\u30DC\u30ED\u30DC\u30ED\u300D\u300C\u624B\u9045\u308C\u300D\u306A\u3069\u306E\u4E0D\u5FEB\u3067\u30DE\u30A4\u30CA\u30B9\u306A\u30A4\u30E1\u30FC\u30B8\u3084\u4E0D\u5B89\u3092\u717D\u308B\u8A00\u8449\u304C\u4F7F\u308F\u308C\u3066\u3044\u306A\u3044\u304B\u53B3\u3057\u304F\u78BA\u8A8D\u3057\u3001\u4E07\u304C\u4E00\u3042\u308C\u3070\u300C\u524D\u5411\u304D\u3067\u5E0C\u671B\u3092\u6301\u3066\u308B\u8A00\u8449\u300D\u306B\u5FC5\u305A\u66F8\u304D\u63DB\u3048\u308B\u3053\u3068\u3002\u307E\u305F\u3001\u6D41\u884C\u306E\u6CBB\u7642\u6CD5\u306B\u5BFE\u3057\u3066\u300C\u3044\u307E\u306E\u3042\u306A\u305F\u306B\u306F\u5F37\u3044\u304B\u3082\u3057\u308C\u306A\u3044\u300D\u3068\u300E\u3084\u3089\u306A\u3044\u9078\u629E\u300F\u3092\u793A\u3059\u8AA0\u5B9F\u3055\u304C\u3042\u308B\u304B\u3002\n    4. \u30D5\u30A9\u30FC\u30DE\u30C3\u30C8: \u6307\u5B9A\u3055\u308C\u305F\u898B\u51FA\u3057\uFF08Dear You, \u3084\u3001\u307E\u305A\u3001\u304A\u4F1D\u3048\u3057\u305F\u3044\u5927\u5207\u306A\u3053\u3068\u3001\u306A\u3069\uFF09\u3084\u3001\u898B\u51FA\u3057\u300C\u3042\u306A\u305F\u306E\u4E0D\u5B89\u306B\u5BC4\u308A\u6DFB\u3063\u3066\u300D\u306E\u4E2D\u306BFAQ\uFF08Q&A\u5F62\u5F0F\u3067\u50CD\u304F\u5973\u6027\u76EE\u7DDA\u306E\u4EBA\u808C\u611F\u3042\u308B\u56DE\u7B54\uFF09\u3068\u30B5\u30A4\u30F3\u753B\u50CF\u304C\u5165\u3063\u3066\u3044\u308B\u304B\u3002\n    5. \u79D8\u5BC6\u4FDD\u6301\uFF08Confidentiality\uFF09: \u300C\u767D\u91D1\u9AD8\u8F2A\u300D\u300C\u5E83\u5C3E\u300D\u3068\u3044\u3063\u305F\u5177\u4F53\u7684\u306A\u5730\u540D\u3084\u3001\u81EA\u8EAB\u306E\u30AF\u30EA\u30CB\u30C3\u30AF\u306E\u300C\u958B\u696D\u30FB\u958B\u9662\u300D\u306B\u95A2\u3059\u308B\u4E88\u544A\u30FB\u8A00\u53CA\u304C\u306A\u3044\u304B\u3002\u300C\u5F53\u9662\u3067\u306F\u300D\u300CThe Skin Atelier\u3067\u306F\u300D\u7B49\u3082\u7981\u6B62\u3002\n    6. \u30D1\u30E9\u30B0\u30E9\u30D5\u30FB\u30E9\u30A4\u30C6\u30A3\u30F3\u30B0\u306E\u5FB9\u5E95\uFF08Readability\uFF09: 1\u3064\u306E\u6BB5\u843D\u306B\u8907\u6570\u306E\u30C8\u30D4\u30C3\u30AF\u304C\u8A70\u3081\u8FBC\u307E\u308C\u3066\u3044\u306A\u3044\u304B\u3002\u5404\u6BB5\u843D\u306E\u6700\u521D\u306E1\u6587\u3067\u7D50\u8AD6\u304C\u8FF0\u3079\u3089\u308C\u3066\u3044\u308B\u304B\u3002\n\n    \u3010\u7D76\u5BFE\u53B3\u5B88\u306E\u51FA\u529B\u30EB\u30FC\u30EB\u3011\n    - \u3042\u306A\u305F\u306E\u691C\u95B2\u7D50\u679C\u3084\u30B3\u30E1\u30F3\u30C8\u3001\u611F\u60F3\u306F\u4E00\u5207\u51FA\u529B\u3057\u306A\u3044\u3067\u304F\u3060\u3055\u3044\u3002\n    - \u300C\u627F\u77E5\u3044\u305F\u3057\u307E\u3057\u305F\u300D\u300C\u691C\u95B2\u7D50\u679C\u300D\u300C\u4FEE\u6B63\u70B9\u300D\u7B49\u306E\u524D\u7F6E\u304D\u6587\u8A00\u3082\u4E00\u5207\u4E0D\u8981\u3067\u3059\u3002\n    - \u51FA\u529B\u306F\u300C---\u300D\u3067\u59CB\u307E\u308Bfrontmatter\u304B\u3089\u59CB\u307E\u308BMDX\u306E\u672C\u6587\u306E\u307F\u306B\u3057\u3066\u304F\u3060\u3055\u3044\u3002\n    - \u30B3\u30FC\u30C9\u30D5\u30A7\u30F3\u30B9\uFF08```markdown \u3084 ```mdx\uFF09\u3067\u56F2\u307E\u306A\u3044\u3067\u304F\u3060\u3055\u3044\u3002\n    - \u4FEE\u6B63\u306E\u6709\u7121\u306B\u95A2\u308F\u3089\u305A\u3001\u5B8C\u5168\u306AMDX\u306E\u307F\u3092\u8FD4\u3057\u3066\u304F\u3060\u3055\u3044\u3002\n\n    \u3010\u30D6\u30ED\u30B0\u539F\u7A3F\u3011\n    ".concat(articleMdx, "\n  ");
                    return [4 /*yield*/, ai.models.generateContent({
                            model: "gemini-2.5-flash",
                            contents: reviewPrompt,
                        })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.text];
            }
        });
    });
}
/**
 * メイン実行関数
 */
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var targetDate, tomorrowStr, args, todayTheme, searchKeywords, isFromSheet, schedules, normalizeDate_1, pending, slug, contentId, researchTarget, researchResult, imageUrl, articleMdx, rawMdx, reviewedMdx, cleanMdx, frontmatterStart, newRow, blocks, result, error_1, execSync, e_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("🚀 ブログ自動生成プロセスを開始します...\n");
                    targetDate = new Date();
                    targetDate.setDate(targetDate.getDate() + 1);
                    tomorrowStr = targetDate.toISOString().split('T')[0];
                    args = process.argv.slice(2);
                    todayTheme = args[0];
                    searchKeywords = "";
                    isFromSheet = false;
                    if (!!todayTheme) return [3 /*break*/, 2];
                    console.log("📥 引数なしのため、ThemeScheduleから今日の未執筆テーマを取得します...");
                    return [4 /*yield*/, sheets_db_1.SheetsDB.getThemeSchedule()];
                case 1:
                    schedules = (_a.sent()) || [];
                    normalizeDate_1 = function (d) {
                        if (!d)
                            return "";
                        var parts = d.replace(/\//g, '-').split('-');
                        if (parts.length === 3) {
                            return "".concat(parts[0], "-").concat(parts[1].padStart(2, '0'), "-").concat(parts[2].padStart(2, '0'));
                        }
                        return d;
                    };
                    pending = schedules.find(function (s) {
                        return s.brand === "atelier" &&
                            s.status === "pending" &&
                            normalizeDate_1(s.date) === tomorrowStr;
                    });
                    if (pending) {
                        todayTheme = pending.theme;
                        searchKeywords = pending.searchKeywords;
                        isFromSheet = true;
                        console.log("\uD83C\uDFAF \u30B7\u30FC\u30C8\u304B\u3089\u7FCC\u65E5\u5206\u306E\u30C6\u30FC\u30DE\u3092\u53D6\u5F97\u3057\u307E\u3057\u305F: ".concat(todayTheme));
                    }
                    else {
                        todayTheme = "美容皮膚科における最新のスキンケアトレンドと肌質改善";
                        console.log("\u26A0\uFE0F \u660E\u65E5\u306E\u4FDD\u7559\u4E2D\u30C6\u30FC\u30DE\u304C\u898B\u3064\u304B\u3089\u306A\u3044\u305F\u3081\u3001\u30C7\u30D5\u30A9\u30EB\u30C8\u30C6\u30FC\u30DE\u3067\u9032\u884C\u3057\u307E\u3059: ".concat(todayTheme));
                    }
                    _a.label = 2;
                case 2:
                    slug = "blog-auto-".concat(tomorrowStr, "-").concat(Math.random().toString(36).substring(7));
                    contentId = "blog-".concat(tomorrowStr, "-").concat(slug);
                    researchTarget = searchKeywords ? "".concat(todayTheme, " (").concat(searchKeywords, ")") : todayTheme;
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 20, , 21]);
                    return [4 /*yield*/, performDeepResearch(researchTarget)];
                case 4:
                    researchResult = _a.sent();
                    console.log("✅ リサーチ完了\n");
                    // ② 写真の自動取得
                    console.log("📸 LP用のサムネイル画像を取得中...");
                    return [4 /*yield*/, fetchAestheticImage()];
                case 5:
                    imageUrl = _a.sent();
                    return [4 /*yield*/, generateBlogPost(todayTheme, researchResult || "", imageUrl)];
                case 6:
                    articleMdx = _a.sent();
                    console.log("✅ 記事生成完了\n");
                    rawMdx = articleMdx || "";
                    return [4 /*yield*/, reviewArticle(rawMdx)];
                case 7:
                    reviewedMdx = _a.sent();
                    console.log("✅ 自動検閲・修正完了\n");
                    cleanMdx = reviewedMdx || "";
                    // コードフェンスの除去
                    cleanMdx = cleanMdx.replace(/^```(?:markdown|mdx)?\n/gm, "").replace(/\n```$/gm, "").trim();
                    frontmatterStart = cleanMdx.indexOf('---');
                    if (frontmatterStart > 0) {
                        cleanMdx = cleanMdx.substring(frontmatterStart);
                    }
                    newRow = {
                        content_id: contentId,
                        brand: 'atelier',
                        type: 'blog',
                        title: slug,
                        generation_recipe: JSON.stringify({
                            captionText: cleanMdx,
                            theme: todayTheme
                        }),
                        status: 'pending',
                    };
                    console.log("\uD83D\uDCE6 Google Sheets \u306B\u30D6\u30ED\u30B0\u8A18\u4E8B\u3092\u30AD\u30E5\u30FC\u767B\u9332\u4E2D...");
                    return [4 /*yield*/, sheets_db_1.SheetsDB.appendRows([newRow])];
                case 8:
                    _a.sent();
                    // ⑦ Slackへ承認メッセージを送信
                    console.log("\uD83D\uDCE4 Slack \u3078\u627F\u8A8D\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u9001\u4FE1\u4E2D...");
                    blocks = [
                        {
                            type: 'section',
                            text: {
                                type: 'mrkdwn',
                                text: "\uD83D\uDCDD *\u30D6\u30ED\u30B0\u8A18\u4E8B*: `".concat(slug, "`\n\u3010\u914D\u4FE1\u5148: \uD83D\uDFE6 hiroo-open / The Skin Atelier\u3011\n\n\u203B\u672C\u6587\u306F\u30B9\u30EC\u30C3\u30C9\u5185\u306E\u30D5\u30A1\u30A4\u30EB\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u3066\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044 \uD83D\uDC47")
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
                                    value: JSON.stringify({ id: contentId, batchId: 'auto-blog', brand: 'atelier' }),
                                },
                                {
                                    type: 'button',
                                    text: { type: 'plain_text', text: '✏️ 修正依頼', emoji: true },
                                    action_id: 'revise_content',
                                    value: JSON.stringify({ id: contentId, brand: 'atelier' }),
                                },
                                {
                                    type: 'button',
                                    text: { type: 'plain_text', text: '❌ 却下', emoji: true },
                                    style: 'danger',
                                    action_id: 'reject_content',
                                    value: JSON.stringify({ id: contentId, brand: 'atelier' }),
                                },
                            ]
                        }
                    ];
                    _a.label = 9;
                case 9:
                    _a.trys.push([9, 14, , 15]);
                    return [4 /*yield*/, slackClient.chat.postMessage({
                            channel: TARGET_CHANNEL,
                            text: "\uD83D\uDCDD \u30D6\u30ED\u30B0\u8A18\u4E8B ".concat(slug, " \u2014 \u30EC\u30D3\u30E5\u30FC\u5F85\u3061"),
                            blocks: blocks,
                        })];
                case 10:
                    result = _a.sent();
                    console.log("\u2705 Slack\u89AA\u901A\u77E5\u5B8C\u4E86: ".concat(result.ts));
                    if (!result.ts) return [3 /*break*/, 13];
                    // ⑧ スレッド内にMarkdown全文を直接テキスト返信
                    return [4 /*yield*/, slackClient.chat.postMessage({
                            channel: TARGET_CHANNEL,
                            thread_ts: result.ts,
                            text: cleanMdx,
                        })];
                case 11:
                    // ⑧ スレッド内にMarkdown全文を直接テキスト返信
                    _a.sent();
                    return [4 /*yield*/, sheets_db_1.SheetsDB.updateRow(contentId, { slack_ts: result.ts })];
                case 12:
                    _a.sent();
                    _a.label = 13;
                case 13: return [3 /*break*/, 15];
                case 14:
                    error_1 = _a.sent();
                    console.error("\u274C Slack\u901A\u77E5\u30A8\u30E9\u30FC:", error_1);
                    return [3 /*break*/, 15];
                case 15:
                    _a.trys.push([15, 18, , 19]);
                    if (!isFromSheet) return [3 /*break*/, 17];
                    return [4 /*yield*/, sheets_db_1.SheetsDB.updateThemeScheduleStatus(todayTheme, "completed")];
                case 16:
                    _a.sent();
                    console.log("✅ ThemeScheduleのステータスを'completed'に更新しました。");
                    _a.label = 17;
                case 17:
                    console.log("\n🚀 引き続き X (Twitter) 用の投稿を生成します...");
                    execSync = require('child_process').execSync;
                    // X投稿スクリプトを呼び出し（引数として、同じテーマと背景コンテキストを渡す）
                    execSync("npx tsx scripts/auto-publish/generate-x-post.ts \"".concat(todayTheme, "\" \"\u65E5\u3005\u306E\u8A3A\u5BDF\u3084\u6700\u65B0\u306E\u7F8E\u5BB9\u30CB\u30E5\u30FC\u30B9\u304B\u3089\""), { stdio: 'inherit' });
                    console.log("✅ X 投稿の生成フローが完了しました！");
                    return [3 /*break*/, 19];
                case 18:
                    e_1 = _a.sent();
                    console.error("⚠️ X用投稿スクリプトの呼び出し中にエラーが発生しました:", e_1);
                    return [3 /*break*/, 19];
                case 19:
                    console.log("\n\uD83C\uDF89 \u3059\u3079\u3066\u306E\u81EA\u52D5\u5316\u30D7\u30ED\u30BB\u30B9\u304C\u5B8C\u4E86\u3057\u307E\u3057\u305F\uFF01");
                    return [3 /*break*/, 21];
                case 20:
                    error_2 = _a.sent();
                    console.error("❌ エラーが発生しました:", error_2);
                    return [3 /*break*/, 21];
                case 21: return [2 /*return*/];
            }
        });
    });
}
main();
